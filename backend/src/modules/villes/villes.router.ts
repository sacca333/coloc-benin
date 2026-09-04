import { Router } from 'express';
import { prisma } from '../../config/database';

export const villesRouter = Router();

// GET /api/villes — liste publique des villes actives (utilisée par les formulaires d'inscription et de création d'annonce)
villesRouter.get('/', async (_req, res) => {
    try {
        const villes = await prisma.ville.findMany({
            where: { active: true },
            orderBy: { nom: 'asc' },
            select: { nom: true },
        });
        res.json(villes.map(v => v.nom));
    } catch (error) {
        console.error('[villes GET]', error);
        res.status(500).json({ error: 'Erreur serveur' });
    }
});