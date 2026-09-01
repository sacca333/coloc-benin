import { Request, Response } from 'express';
import { prisma } from '../../config/database';
import { AuthRequest } from '../../middlewares/auth.middleware';

export const listerAnnonces = async (req: Request, res: Response) => {
  const { ville, typeAnnonce, budgetMax, nbPlaces, equipements, sexe } = req.query;
  const where: any = { statut: 'ACTIVE' };
  if (ville) where.ville = { contains: String(ville), mode: 'insensitive' };
  if (typeAnnonce) where.type = typeAnnonce;
  if (budgetMax) { const budget = Math.min(Number(budgetMax), 2147483647); if (!isNaN(budget)) where.loyerTotal = { lte: budget }; }
  if (nbPlaces) where.nbPlaces = { gte: Number(nbPlaces) };
  if (equipements) {
    const eqs = String(equipements).split(',');
    where.equipements = { hasEvery: eqs };
  }
  if (sexe) where.proprietaire = { sexe: String(sexe) };
  const annonces = await prisma.annonce.findMany({
    where,
    include: {
      proprietaire: { select: { id: true, nom: true, prenom: true, photo: true, sexe: true } },
    },
    orderBy: { createdAt: 'desc' },
    take: 50,
  });
  res.json(annonces);
};

export const getAnnonce = async (req: Request, res: Response) => {
  const annonce = await prisma.annonce.findUnique({
    where: { id: req.params.id },
    include: {
      proprietaire: { select: { id: true, nom: true, prenom: true, photo: true, sexe: true } },
    },
  });
  if (!annonce) return res.status(404).json({ error: 'Annonce introuvable' });
  return res.json(annonce);
};

export const creerAnnonce = async (req: AuthRequest, res: Response) => {
  try {
    const { type, adresse, quartier, ville, loyerTotal, nbPlaces, nbColocataires, caution, description, equipements } = req.body;
    const photos = (req.files as Express.Multer.File[] | undefined)?.map(f => f.path) || [];

    const annonce = await prisma.annonce.create({
      data: {
        proprietaireId: req.user!.id,
        type,
        adresse,
        quartier,
        ville,
        loyerTotal: Number(loyerTotal),
        nbPlaces: Number(nbPlaces),
        placesRestantes: Number(nbPlaces),
        nbColocataires: nbColocataires ? Number(nbColocataires) : undefined,
        caution: caution ? Number(caution) : undefined,
        description,
        equipements: equipements ? JSON.parse(equipements) : [],
        photos,
      },
    });

    // Notifier tous les utilisateurs de la meme ville
    if (ville) {
      const utilisateurs = await prisma.utilisateur.findMany({
        where: {
          ville: { contains: ville, mode: 'insensitive' },
          actif: true,
          emailVerifie: true,
          id: { not: req.user!.id },
        },
        select: { id: true },
      });

      if (utilisateurs.length > 0) {
        await prisma.notification.createMany({
          data: utilisateurs.map(u => ({
            utilisateurId: u.id,
            type: 'NOUVELLE_ANNONCE' as const,
            titre: 'Nouvelle annonce dans votre ville',
            message: 'Nouvelle annonce de colocation disponible a ' + ville,
            data: { annonceId: annonce.id },
          })),
        });
      }
    }

    return res.status(201).json(annonce);
  } catch (error) {
    console.error('[creerAnnonce]', error);
    return res.status(500).json({ error: 'Erreur serveur lors de la creation' });
  }
};

export const modifierAnnonce = async (req: AuthRequest, res: Response) => {
  try {
    const annonce = await prisma.annonce.findUnique({ where: { id: req.params.id } });
    if (!annonce) return res.status(404).json({ error: 'Annonce introuvable' });
    if (annonce.proprietaireId !== req.user!.id && req.user!.typeCompte !== 'ADMIN') {
      return res.status(403).json({ error: 'Non autorise' });
    }

    const { type, adresse, quartier, ville, loyerTotal, nbPlaces, nbColocataires, caution, description, equipements, photosExistantes } = req.body;

    // Photos que l'utilisateur a choisi de conserver (URLs déjà en base, filtrées côté front)
    let photosConservees: string[] = annonce.photos;
    if (photosExistantes !== undefined) {
      try { photosConservees = JSON.parse(photosExistantes); } catch { /* on garde les photos actuelles si parsing invalide */ }
    }

    // Nouvelles photos uploadées et compressées vers Cloudinary
    const nouvellesPhotos = (req.files as Express.Multer.File[] | undefined)?.map(f => f.path) || [];
    const photos = [...photosConservees, ...nouvellesPhotos].slice(0, 5);

    const data: any = { photos };
    if (type !== undefined) data.type = type;
    if (adresse !== undefined) data.adresse = adresse;
    if (quartier !== undefined) data.quartier = quartier;
    if (ville !== undefined) data.ville = ville;
    if (loyerTotal !== undefined) data.loyerTotal = Number(loyerTotal);
    if (nbPlaces !== undefined) data.nbPlaces = Number(nbPlaces);
    if (nbColocataires !== undefined) data.nbColocataires = Number(nbColocataires);
    if (caution !== undefined) data.caution = caution ? Number(caution) : null;
    if (description !== undefined) data.description = description;
    if (equipements !== undefined) data.equipements = typeof equipements === 'string' ? JSON.parse(equipements) : equipements;

    const updated = await prisma.annonce.update({ where: { id: req.params.id }, data });
    return res.json(updated);
  } catch (error) {
    console.error('[modifierAnnonce]', error);
    return res.status(500).json({ error: 'Erreur serveur lors de la modification' });
  }
};

export const supprimerAnnonce = async (req: AuthRequest, res: Response) => {
  const annonce = await prisma.annonce.findUnique({ where: { id: req.params.id } });
  if (!annonce) return res.status(404).json({ error: 'Annonce introuvable' });
  if (annonce.proprietaireId !== req.user!.id && req.user!.typeCompte !== 'ADMIN') {
    return res.status(403).json({ error: 'Non autorise' });
  }
  await prisma.annonce.update({
    where: { id: req.params.id },
    data: { statut: 'SUPPRIMEE' },
  });
  res.json({ message: 'Annonce supprimee' });
};