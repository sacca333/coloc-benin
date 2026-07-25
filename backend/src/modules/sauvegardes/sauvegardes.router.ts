import { Router, Response } from 'express';
import { authenticate } from '../../middlewares/auth.middleware';
import { AuthRequest } from '../../middlewares/auth.middleware';
import { prisma } from '../../config/database';

export const sauvegardesRouter = Router();
sauvegardesRouter.use(authenticate);

// Lister mes sauvegardes
sauvegardesRouter.get('/', async (req: AuthRequest, res: Response) => {
    try {
        const sauvegardes = await prisma.sauvegarde.findMany({
            where: { utilisateurId: req.user!.id },
            include: {
                annonce: {
                    include: {
                        proprietaire: { select: { id: true, nom: true, prenom: true, photo: true } },
                    },
                },
            },
            orderBy: { createdAt: 'desc' },
        });
        res.json(sauvegardes.map(s => s.annonce));
    } catch (error) {
        console.error('[sauvegardes GET]', error); // ← ajoutez ceci

        res.status(500).json({ error: 'Erreur serveur' });
    }
});

// Sauvegarder une annonce
sauvegardesRouter.post('/:annonceId', async (req: AuthRequest, res: Response) => {
    try {
        await prisma.sauvegarde.create({
            data: { utilisateurId: req.user!.id, annonceId: req.params.annonceId },
        });
        res.status(201).json({ message: 'Annonce sauvegardée' });
    } catch {
        res.status(400).json({ error: 'Déjà sauvegardée ou annonce introuvable' });
    }
});

// Supprimer une sauvegarde
sauvegardesRouter.delete('/:annonceId', async (req: AuthRequest, res: Response) => {
    try {
        await prisma.sauvegarde.deleteMany({
            where: { utilisateurId: req.user!.id, annonceId: req.params.annonceId },
        });
        res.json({ message: 'Sauvegarde supprimée' });
    } catch {
        res.status(500).json({ error: 'Erreur serveur' });
    }
});

// Vérifier si une annonce est sauvegardée
sauvegardesRouter.get('/verifie/:annonceId', async (req: AuthRequest, res: Response) => {
    try {
        const sauvegarde = await prisma.sauvegarde.findUnique({
            where: { utilisateurId_annonceId: { utilisateurId: req.user!.id, annonceId: req.params.annonceId } },
        });
        res.json({ sauvegardee: !!sauvegarde });
    } catch {
        res.status(500).json({ error: 'Erreur serveur' });
    }
});