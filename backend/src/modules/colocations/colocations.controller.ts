import { Response } from 'express';
import { prisma } from '../../config/database';
import { AuthRequest } from '../../middlewares/auth.middleware';
import { sendEmail } from '../../utils/mailer';
import jwt from 'jsonwebtoken';

export const creerColocation = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;

    const dejaActif = await prisma.colocataire.findFirst({
      where: { utilisateurId: userId, statut: 'ACTIF' },
    });
    if (dejaActif) {
      return res.status(409).json({ error: "Vous êtes déjà membre actif d'une colocation" });
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

    return res.status(201).json(colocation);
  } catch (error) {
    console.error('[creerColocation]', error);
    return res.status(500).json({ error: 'Erreur serveur lors de la création de la colocation' });
  }
};

export const mesColocations = async (req: AuthRequest, res: Response) => {
  try {
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

    return res.json(result);
  } catch (error) {
    console.error('[mesColocations]', error);
    return res.status(500).json({ error: 'Erreur serveur lors de la récupération des colocations' });
  }
};

export const getColocation = async (req: AuthRequest, res: Response) => {
  try {
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
    return res.json(colocation);
  } catch (error) {
    console.error('[getColocation]', error);
    return res.status(500).json({ error: 'Erreur serveur lors de la récupération de la colocation' });
  }
};

export const inviterColocataire = async (req: AuthRequest, res: Response) => {
  try {
    const { email } = req.body;
    const colocId = req.params.id;

    const colocation = await prisma.colocation.findUnique({
      where: { id: colocId },
      include: { colocataires: true },
    });
    if (!colocation) return res.status(404).json({ error: 'Colocation introuvable' });

    const actifs = colocation.colocataires.filter(c => c.statut === 'ACTIF').length;
    if (actifs >= colocation.nbPlaces) {
      return res.status(400).json({ error: 'La colocation est complète' });
    }

    const invite = await prisma.utilisateur.findUnique({ where: { email } });
    if (!invite) return res.status(404).json({ error: 'Aucun compte trouvé pour cet email' });

    // Vérifier que l'invité n'est pas déjà membre actif de cette colocation
    const dejaMembreColoc = colocation.colocataires.find(
      c => c.utilisateurId === invite.id && c.statut === 'ACTIF'
    );
    if (dejaMembreColoc) {
      return res.status(409).json({ error: 'Cet utilisateur est déjà membre de cette colocation' });
    }

    // Token JWT signé avec expiration 7 jours (plus sécurisé que base64)
    const token = jwt.sign(
      { colocId, userId: invite.id },
      process.env.JWT_SECRET!,
      { expiresIn: '7d' }
    );

    const lien = `${process.env.FRONTEND_URL}/colocations/${colocId}/accepter/${token}`;

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
        <p style="margin-top:16px;color:#888;font-size:12px">Ce lien expire dans 7 jours. Si vous ne connaissez pas l'expéditeur, ignorez ce message.</p>
      </div>
      `
    );

    return res.json({ message: `Invitation envoyée à ${email}` });
  } catch (error) {
    console.error('[inviterColocataire]', error);
    return res.status(500).json({ error: "Erreur serveur lors de l'envoi de l'invitation" });
  }
};

export const accepterInvitation = async (req: AuthRequest, res: Response) => {
  try {
    const { token } = req.params;

    // Vérifier et décoder le JWT signé
    let payload: { colocId: string; userId: string };
    try {
      payload = jwt.verify(token, process.env.JWT_SECRET!) as { colocId: string; userId: string };
    } catch {
      return res.status(400).json({ error: "Token d'invitation invalide ou expiré" });
    }

    const { colocId, userId } = payload;

    if (userId !== req.user!.id) {
      return res.status(403).json({ error: "Cette invitation n'est pas destinée à votre compte" });
    }

    const dejaActif = await prisma.colocataire.findFirst({
      where: { utilisateurId: userId, statut: 'ACTIF' },
    });
    if (dejaActif) {
      return res.status(409).json({ error: "Vous êtes déjà membre actif d'une colocation" });
    }

    const colocation = await prisma.colocation.findUnique({
      where: { id: colocId },
      include: { colocataires: { where: { statut: 'ACTIF' } } },
    });
    if (!colocation) return res.status(404).json({ error: 'Colocation introuvable' });
    if (colocation.colocataires.length >= colocation.nbPlaces) {
      return res.status(400).json({ error: 'La colocation est complète' });
    }

    await prisma.colocataire.upsert({
      where: { utilisateurId_colocId: { utilisateurId: userId, colocId } },
      create: { utilisateurId: userId, colocId, statut: 'ACTIF', partLoyer: 0 },
      update: { statut: 'ACTIF' },
    });

    const actifs = await prisma.colocataire.findMany({
      where: { colocId, statut: 'ACTIF' },
    });
    const nouvellePart = Math.floor(colocation.loyerTotal / actifs.length);
    await prisma.colocataire.updateMany({
      where: { colocId, statut: 'ACTIF' },
      data: { partLoyer: nouvellePart },
    });

    if (actifs.length >= 2) {
      await prisma.colocation.update({
        where: { id: colocId },
        data: { statut: 'ACTIVE' },
      });
    }

    return res.json({ message: 'Vous avez rejoint la colocation avec succès' });
  } catch (error) {
    console.error('[accepterInvitation]', error);
    return res.status(500).json({ error: "Erreur serveur lors de l'acceptation de l'invitation" });
  }
};

export const marquerLoyerPaye = async (req: AuthRequest, res: Response) => {
  try {
    const result = await prisma.colocataire.updateMany({
      where: {
        colocId: req.params.id,
        utilisateurId: req.user!.id,
        statut: 'ACTIF',
      },
      data: { loyerConfirme: true },
    });

    if (result.count === 0) {
      return res.status(404).json({ error: "Vous n'êtes pas membre actif de cette colocation" });
    }

    return res.json({ message: 'Confirmation de paiement enregistrée (suivi interne)' });
  } catch (error) {
    console.error('[marquerLoyerPaye]', error);
    return res.status(500).json({ error: 'Erreur serveur lors de la confirmation du loyer' });
  }
};

export const mettreAJourStatutColocataire = async (req: AuthRequest, res: Response) => {
  try {
    const { statut } = req.body;
    if (!['ACTIF', 'PARTI'].includes(statut)) {
      return res.status(400).json({ error: 'Statut invalide. Valeurs : ACTIF, PARTI' });
    }

    const colocId = req.params.id;
    const targetUserId = req.params.userId;
    const demandeurId = req.user!.id;

    // Vérifier que le demandeur est bien membre actif de cette colocation
    const demandeur = await prisma.colocataire.findFirst({
      where: { colocId, utilisateurId: demandeurId, statut: 'ACTIF' },
    });
    if (!demandeur) {
      return res.status(403).json({ error: "Vous n'êtes pas autorisé à modifier cette colocation" });
    }

    await prisma.colocataire.updateMany({
      where: { colocId, utilisateurId: targetUserId },
      data: { statut, loyerConfirme: false },
    });

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

    return res.json({ message: 'Statut du colocataire mis à jour' });
  } catch (error) {
    console.error('[mettreAJourStatutColocataire]', error);
    return res.status(500).json({ error: 'Erreur serveur lors de la mise à jour du statut' });
  }
};