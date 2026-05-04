import { Router } from 'express';
import { authenticate, requireAdmin, AuthRequest } from '../../middlewares/auth.middleware';
import { prisma } from '../../config/database';
import { Response } from 'express';

export const signalementsRouter = Router();

// ── Utilisateur : signaler une annonce ──────────────────────────────
signalementsRouter.post('/', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { annonceId, raison, details } = req.body;
    const userId = req.user!.id;

    if (!annonceId || !raison) {
      return res.status(400).json({ error: 'annonceId et raison sont requis' });
    }

    // Vérifier que l'annonce existe
    const annonce = await prisma.annonce.findUnique({ where: { id: annonceId } });
    if (!annonce) return res.status(404).json({ error: 'Annonce introuvable' });

    // Vérifier que l'utilisateur n'a pas déjà signalé cette annonce
    const existant = await prisma.signalement.findFirst({
      where: { annonceId, signaleurId: userId },
    });
    if (existant) return res.status(409).json({ error: 'Vous avez déjà signalé cette annonce' });

    const signalement = await prisma.signalement.create({
      data: { annonceId, signaleurId: userId, raison, details: details || null, statut: 'EN_ATTENTE' },
    });

    res.status(201).json({ message: 'Signalement envoyé avec succès', signalement });
  } catch (err) {
    console.error('[signalements POST]', err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// ── Admin : lister les signalements ─────────────────────────────────
signalementsRouter.get('/', authenticate, requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const { statut = '', page = '1', limit = '20' } = req.query;
    const skip = (Number(page) - 1) * Number(limit);
    const where: any = {};
    if (statut) where.statut = statut;

    const [signalements, total] = await Promise.all([
      prisma.signalement.findMany({
        where,
        include: {
          annonce: {
            select: {
              id: true, ville: true, quartier: true, loyerTotal: true, statut: true,
              proprietaire: { select: { id: true, nom: true, prenom: true, email: true } },
            },
          },
          signaleur: { select: { id: true, nom: true, prenom: true, email: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: Number(limit),
      }),
      prisma.signalement.count({ where }),
    ]);

    res.json({ signalements, total, pages: Math.ceil(total / Number(limit)) });
  } catch (err) {
    console.error('[signalements GET]', err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// ── Admin : traiter un signalement ──────────────────────────────────
signalementsRouter.put('/:id/traiter', authenticate, requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const { statut, action } = req.body;
    // statut: TRAITE | REJETE
    // action: SUPPRIMER_ANNONCE | MODERER_ANNONCE | AUCUNE

    const signalement = await prisma.signalement.findUnique({
      where: { id: req.params.id },
      include: { annonce: true },
    });
    if (!signalement) return res.status(404).json({ error: 'Signalement introuvable' });

    // Appliquer l'action sur l'annonce si nécessaire
    if (action === 'SUPPRIMER_ANNONCE') {
      await prisma.annonce.update({
        where: { id: signalement.annonceId },
        data: { statut: 'SUPPRIMEE' },
      });
    } else if (action === 'MODERER_ANNONCE') {
      await prisma.annonce.update({
        where: { id: signalement.annonceId },
        data: { statut: 'MODEREE' },
      });
    }

    // Mettre à jour le statut du signalement
    const updated = await prisma.signalement.update({
      where: { id: req.params.id },
      data: { statut: statut || 'TRAITE' },
    });

    // Marquer tous les signalements de la même annonce comme traités
    if (statut === 'TRAITE') {
      await prisma.signalement.updateMany({
        where: { annonceId: signalement.annonceId, statut: 'EN_ATTENTE' },
        data: { statut: 'TRAITE' },
      });
    }

    res.json({ message: 'Signalement traité', signalement: updated });
  } catch (err) {
    console.error('[signalements PUT]', err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// ── Stats signalements pour le dashboard admin ───────────────────────
signalementsRouter.get('/stats', authenticate, requireAdmin, async (_req, res: Response) => {
  try {
    const [enAttente, traites, rejetes] = await Promise.all([
      prisma.signalement.count({ where: { statut: 'EN_ATTENTE' } }),
      prisma.signalement.count({ where: { statut: 'TRAITE' } }),
      prisma.signalement.count({ where: { statut: 'REJETE' } }),
    ]);
    res.json({ enAttente, traites, rejetes, total: enAttente + traites + rejetes });
  } catch (err) {
    res.status(500).json({ error: 'Erreur serveur' });
  }
});
