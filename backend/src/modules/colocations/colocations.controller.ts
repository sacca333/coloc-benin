import { Response } from 'express';
import { prisma } from '../../config/database';
import { AuthRequest } from '../../middlewares/auth.middleware';
import { sendEmail } from '../../utils/mailer';

export const creerColocation = async (req: AuthRequest, res: Response) => {
  const userId = req.user!.id;

  const dejaActif = await prisma.colocataire.findFirst({
    where: { utilisateurId: userId, statut: 'ACTIF' },
  });
  if (dejaActif) {
    return res.status(409).json({ error: 'Vous êtes déjà membre actif d\'une colocation' });
  }

  const { nom, adresse, ville, loyerTotal, nbPlaces, description } = req.body;

  const colocation = await prisma.colocation.create({
    data: {
      nom, adresse, ville,
      loyerTotal: Number(loyerTotal),
      nbPlaces: Number(nbPlaces),
      description,
      statut: 'EN_ATTENTE',
      colocataires: {
        create: {
          utilisateurId: userId,
          partLoyer: Number(loyerTotal),
          statut: 'ACTIF',
        },
      },
    },
    include: {
      colocataires: {
        include: {
          utilisateur: { select: { nom: true, prenom: true, email: true } },
        },
      },
    },
  });

  res.status(201).json(colocation);
};

export const mesColocations = async (req: AuthRequest, res: Response) => {
  const colocataires = await prisma.colocataire.findMany({
    where: { utilisateurId: req.user!.id },
    include: {
      colocation: {
        include: {
          colocataires: {
            include: {
              utilisateur: { select: { id: true, nom: true, prenom: true, photo: true } },
            },
          },
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  const result = colocataires.map(c => ({
    ...c.colocation,
    monStatut: c.statut,
    maPartLoyer: c.partLoyer,
  }));

  res.json(result);
};

export const getColocation = async (req: AuthRequest, res: Response) => {
  const colocation = await prisma.colocation.findUnique({
    where: { id: req.params.id },
    include: {
      annonce: true,
      colocataires: {
        include: {
          utilisateur: {
            select: { id: true, nom: true, prenom: true, photo: true, universite: true },
          },
        },
        orderBy: { createdAt: 'asc' },
      },
    },
  });
  if (!colocation) return res.status(404).json({ error: 'Colocation introuvable' });
  res.json(colocation);
};

export const inviterColocataire = async (req: AuthRequest, res: Response) => {
  const { email } = req.body;
  const colocId = req.params.id;

  const colocation = await prisma.colocation.findUnique({
    where: { id: colocId },
    include: { colocataires: { where: { statut: 'ACTIF' } } },
  });
  if (!colocation) return res.status(404).json({ error: 'Colocation introuvable' });

  if (colocation.colocataires.length >= colocation.nbPlaces) {
    return res.status(400).json({ error: 'La colocation est complète' });
  }

  const invite = await prisma.utilisateur.findUnique({ where: { email } });
  if (!invite) return res.status(404).json({ error: 'Aucun compte trouvé pour cet email' });

  const tokenB64 = Buffer.from(`${colocId}:${invite.id}`).toString('base64');
  const lien = `${process.env.FRONTEND_URL}/colocations/${colocId}/accepter/${tokenB64}`;

  await sendEmail(
    email,
    `Invitation à rejoindre "${colocation.nom}" — ColocBénin`,
    `
    <div style="font-family:sans-serif;max-width:520px;margin:auto">
      <h2>Bonjour ${invite.prenom} !</h2>
      <p>Vous êtes invité(e) à rejoindre la colocation <strong>${colocation.nom}</strong> à ${colocation.ville}.</p>
      <p>Loyer total : <strong>${colocation.loyerTotal.toLocaleString('fr-FR')} FCFA / mois</strong></p>
      <a href="${lien}" style="display:inline-block;padding:12px 24px;background:#7F77DD;color:#fff;border-radius:8px;text-decoration:none;font-weight:500;margin-top:12px">
        Accepter l'invitation
      </a>
      <p style="margin-top:16px;color:#888;font-size:12px">Si vous ne connaissez pas l'expéditeur, ignorez ce message.</p>
    </div>
    `
  );

  res.json({ message: `Invitation envoyée à ${email}` });
};

export const accepterInvitation = async (req: AuthRequest, res: Response) => {
  const { token } = req.params;
  let colocId: string, userId: string;
  try {
    const decoded = Buffer.from(token, 'base64').toString();
    [colocId, userId] = decoded.split(':');
  } catch {
    return res.status(400).json({ error: 'Token invalide' });
  }

  if (userId !== req.user!.id) {
    return res.status(403).json({ error: 'Cette invitation n\'est pas destinée à votre compte' });
  }

  const dejaActif = await prisma.colocataire.findFirst({
    where: { utilisateurId: userId, statut: 'ACTIF' },
  });
  if (dejaActif) {
    return res.status(409).json({ error: 'Vous êtes déjà membre actif d\'une colocation' });
  }

  const colocation = await prisma.colocation.findUnique({
    where: { id: colocId },
    include: { colocataires: { where: { statut: 'ACTIF' } } },
  });
  if (!colocation) return res.status(404).json({ error: 'Colocation introuvable' });
  if (colocation.colocataires.length >= colocation.nbPlaces) {
    return res.status(400).json({ error: 'La colocation est complète' });
  }

  // Ajouter le nouveau colocataire
  await prisma.colocataire.upsert({
    where: { utilisateurId_colocId: { utilisateurId: userId, colocId } },
    create: { utilisateurId: userId, colocId, statut: 'ACTIF', partLoyer: 0 },
    update: { statut: 'ACTIF' },
  });

  // Recalculer toutes les parts
  const actifs = await prisma.colocataire.findMany({
    where: { colocId, statut: 'ACTIF' },
  });
  const nouvellePart = Math.floor(colocation.loyerTotal / actifs.length);
  await prisma.colocataire.updateMany({
    where: { colocId, statut: 'ACTIF' },
    data: { partLoyer: nouvellePart },
  });

  // Activer la colocation si >= 2 membres actifs
  if (actifs.length >= 2) {
    await prisma.colocation.update({
      where: { id: colocId },
      data: { statut: 'ACTIVE' },
    });
  }

  res.json({ message: 'Vous avez rejoint la colocation avec succès' });
};

export const marquerLoyerPaye = async (req: AuthRequest, res: Response) => {
  const result = await prisma.colocataire.updateMany({
    where: {
      colocId: req.params.id,
      utilisateurId: req.user!.id,
      statut: 'ACTIF',
    },
    data: { loyerConfirme: true },
  });

  if (result.count === 0) {
    return res.status(404).json({ error: 'Vous n\'êtes pas membre actif de cette colocation' });
  }

  res.json({ message: 'Confirmation de paiement enregistrée (suivi interne)' });
};

export const mettreAJourStatutColocataire = async (req: AuthRequest, res: Response) => {
  const { statut } = req.body;
  if (!['ACTIF', 'PARTI'].includes(statut)) {
    return res.status(400).json({ error: 'Statut invalide. Valeurs : ACTIF, PARTI' });
  }

  const colocId = req.params.id;
  const targetUserId = req.params.userId;

  await prisma.colocataire.updateMany({
    where: { colocId, utilisateurId: targetUserId },
    data: { statut, loyerConfirme: false },
  });

  // Si quelqu'un part : recalculer les parts et éventuellement désactiver la coloc
  if (statut === 'PARTI') {
    const colocation = await prisma.colocation.findUnique({ where: { id: colocId } });
    if (!colocation) return res.status(404).json({ error: 'Colocation introuvable' });

    const actifs = await prisma.colocataire.findMany({
      where: { colocId, statut: 'ACTIF' },
    });

    if (actifs.length < 2) {
      await prisma.colocation.update({
        where: { id: colocId },
        data: { statut: 'EN_ATTENTE' },
      });
    } else {
      const nouvellePart = Math.floor(colocation.loyerTotal / actifs.length);
      await prisma.colocataire.updateMany({
        where: { colocId, statut: 'ACTIF' },
        data: { partLoyer: nouvellePart },
      });
    }
  }

  res.json({ message: 'Statut du colocataire mis à jour' });
};

