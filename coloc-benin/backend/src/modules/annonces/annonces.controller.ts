import { Request, Response } from 'express';
import { prisma } from '../../config/database';
import { AuthRequest } from '../../middlewares/auth.middleware';

export const listerAnnonces = async (req: Request, res: Response) => {
  try {
    const { ville, typeAnnonce, budgetMax, nbPlaces, equipements } = req.query;

    const where: any = { statut: 'ACTIVE' };
    if (ville) where.ville = { contains: String(ville), mode: 'insensitive' };
    if (typeAnnonce) where.type = typeAnnonce;
    if (budgetMax) where.loyerTotal = { lte: Number(budgetMax) };
    if (nbPlaces) where.nbPlaces = { gte: Number(nbPlaces) };
    if (equipements) {
      const eqs = String(equipements).split(',');
      where.equipements = { hasEvery: eqs };
    }

    const annonces = await prisma.annonce.findMany({
      where,
      include: {
        proprietaire: { select: { id: true, nom: true, prenom: true, photo: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    return res.json(annonces);
  } catch (error) {
    console.error('[listerAnnonces]', error);
    return res.status(500).json({ error: 'Erreur serveur lors de la récupération des annonces' });
  }
};

export const getAnnonce = async (req: Request, res: Response) => {
  try {
    const annonce = await prisma.annonce.findUnique({
      where: { id: req.params.id },
      include: {
        proprietaire: {
          select: { id: true, nom: true, prenom: true, photo: true, universite: true, telephone: true },
        },
        colocation: {
          include: {
            colocataires: {
              where: { statut: 'ACTIF' },
              include: {
                utilisateur: { select: { nom: true, prenom: true, photo: true } },
              },
            },
          },
        },
      },
    });

    if (!annonce) return res.status(404).json({ error: 'Annonce introuvable' });
    return res.json(annonce);
  } catch (error) {
    console.error('[getAnnonce]', error);
    return res.status(500).json({ error: "Erreur serveur lors de la récupération de l'annonce" });
  }
};

export const creerAnnonce = async (req: AuthRequest, res: Response) => {
  try {
    const {
      type, adresse, quartier, ville, loyerTotal,
      nbPlaces, nbColocataires, caution, description, equipements,
    } = req.body;

    const photos = (req.files as Express.Multer.File[] | undefined)
      ?.map(f => `/uploads/${f.filename}`) || [];

    const annonce = await prisma.annonce.create({
      data: {
        proprietaireId: req.user!.id,
        type,
        adresse,
        quartier,
        ville,
        loyerTotal: Number(loyerTotal),
        nbPlaces: Number(nbPlaces),
        nbColocataires: nbColocataires ? Number(nbColocataires) : undefined,
        caution: caution ? Number(caution) : undefined,
        description,
        equipements: equipements ? JSON.parse(equipements) : [],
        photos,
      },
    });

    return res.status(201).json(annonce);
  } catch (error) {
    console.error('[creerAnnonce]', error);
    return res.status(500).json({ error: "Erreur serveur lors de la création de l'annonce" });
  }
};

export const modifierAnnonce = async (req: AuthRequest, res: Response) => {
  try {
    const annonce = await prisma.annonce.findUnique({ where: { id: req.params.id } });
    if (!annonce) return res.status(404).json({ error: 'Annonce introuvable' });

    if (annonce.proprietaireId !== req.user!.id && req.user!.typeCompte !== 'ADMIN') {
      return res.status(403).json({ error: 'Non autorisé' });
    }

    const updated = await prisma.annonce.update({
      where: { id: req.params.id },
      data: req.body,
    });

    return res.json(updated);
  } catch (error) {
    console.error('[modifierAnnonce]', error);
    return res.status(500).json({ error: "Erreur serveur lors de la modification de l'annonce" });
  }
};

export const supprimerAnnonce = async (req: AuthRequest, res: Response) => {
  try {
    const annonce = await prisma.annonce.findUnique({ where: { id: req.params.id } });
    if (!annonce) return res.status(404).json({ error: 'Annonce introuvable' });

    if (annonce.proprietaireId !== req.user!.id && req.user!.typeCompte !== 'ADMIN') {
      return res.status(403).json({ error: 'Non autorisé' });
    }

    await prisma.annonce.update({
      where: { id: req.params.id },
      data: { statut: 'SUPPRIMEE' },
    });

    return res.json({ message: 'Annonce supprimée' });
  } catch (error) {
    console.error('[supprimerAnnonce]', error);
    return res.status(500).json({ error: "Erreur serveur lors de la suppression de l'annonce" });
  }
};