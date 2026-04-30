import { Request, Response } from 'express';
import { prisma } from '../../config/database';
import { AuthRequest } from '../../middlewares/auth.middleware';

// ─── STATS GLOBALES ──────────────────────────────────────────────────────────
export const getStats = async (req: Request, res: Response) => {
    try {
        const now = new Date();
        const debutMois = new Date(now.getFullYear(), now.getMonth(), 1);
        const debutMoisDernier = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const finMoisDernier = new Date(now.getFullYear(), now.getMonth(), 0);

        const [
            totalUsers,
            newUsersThisMonth,
            newUsersLastMonth,
            totalAnnonces,
            annoncesActives,
            totalColocations,
            colocationsActives,
            totalAbonnements,
            abonnementsActifs,
            abonnementsThisMonth,
            abonnementsLastMonth,
            totalDemandes,
            demandesAcceptees,
        ] = await Promise.all([
            prisma.utilisateur.count(),
            prisma.utilisateur.count({ where: { createdAt: { gte: debutMois } } }),
            prisma.utilisateur.count({ where: { createdAt: { gte: debutMoisDernier, lte: finMoisDernier } } }),
            prisma.annonce.count(),
            prisma.annonce.count({ where: { statut: 'ACTIVE' } }),
            prisma.colocation.count(),
            prisma.colocation.count({ where: { statut: 'ACTIVE' } }),
            prisma.abonnement.count(),
            prisma.abonnement.count({ where: { statut: 'ACTIF', periodeFin: { gte: now } } }),
            prisma.abonnement.count({ where: { statut: 'ACTIF', createdAt: { gte: debutMois } } }),
            prisma.abonnement.count({ where: { statut: 'ACTIF', createdAt: { gte: debutMoisDernier, lte: finMoisDernier } } }),
            (prisma as any).demandeColocation.count(),
            (prisma as any).demandeColocation.count({ where: { statut: 'ACCEPTEE' } }),
        ]);

        // Revenus
        const revenus = await prisma.abonnement.aggregate({
            _sum: { montant: true },
            where: { statut: 'ACTIF' },
        });

        const revenusThisMonth = await prisma.abonnement.aggregate({
            _sum: { montant: true },
            where: { statut: 'ACTIF', createdAt: { gte: debutMois } },
        });

        const revenusLastMonth = await prisma.abonnement.aggregate({
            _sum: { montant: true },
            where: { statut: 'ACTIF', createdAt: { gte: debutMoisDernier, lte: finMoisDernier } },
        });

        // Évolution sur 6 mois
        const evolutionMois = [];
        for (let i = 5; i >= 0; i--) {
            const debut = new Date(now.getFullYear(), now.getMonth() - i, 1);
            const fin = new Date(now.getFullYear(), now.getMonth() - i + 1, 0);
            const [users, abos] = await Promise.all([
                prisma.utilisateur.count({ where: { createdAt: { gte: debut, lte: fin } } }),
                prisma.abonnement.count({ where: { statut: 'ACTIF', createdAt: { gte: debut, lte: fin } } }),
            ]);
            evolutionMois.push({
                mois: debut.toLocaleDateString('fr-FR', { month: 'short' }),
                users,
                abonnements: abos,
                revenus: abos * 300,
            });
        }

        // Répartition par ville
        const parVille = await prisma.utilisateur.groupBy({
            by: ['ville'],
            _count: true,
            orderBy: { _count: { ville: 'desc' } },
            take: 5,
            where: { ville: { not: null } },
        });

        // Répartition annonces par type
        const annonceParType = await prisma.annonce.groupBy({
            by: ['type'],
            _count: true,
        });

        return res.json({
            utilisateurs: {
                total: totalUsers,
                nouveauxCeMois: newUsersThisMonth,
                nouveauxMoisDernier: newUsersLastMonth,
                evolution: newUsersLastMonth > 0
                    ? Math.round(((newUsersThisMonth - newUsersLastMonth) / newUsersLastMonth) * 100)
                    : 100,
            },
            annonces: {
                total: totalAnnonces,
                actives: annoncesActives,
                parType: annonceParType,
            },
            colocations: {
                total: totalColocations,
                actives: colocationsActives,
                tauxSucces: totalDemandes > 0 ? Math.round((demandesAcceptees / totalDemandes) * 100) : 0,
            },
            abonnements: {
                total: totalAbonnements,
                actifs: abonnementsActifs,
                ceMois: abonnementsThisMonth,
                moisDernier: abonnementsLastMonth,
                evolution: abonnementsLastMonth > 0
                    ? Math.round(((abonnementsThisMonth - abonnementsLastMonth) / abonnementsLastMonth) * 100)
                    : 100,
            },
            revenus: {
                total: revenus._sum.montant || 0,
                ceMois: revenusThisMonth._sum.montant || 0,
                moisDernier: revenusLastMonth._sum.montant || 0,
                evolution: (revenusLastMonth._sum.montant || 0) > 0
                    ? Math.round((((revenusThisMonth._sum.montant || 0) - (revenusLastMonth._sum.montant || 0)) / (revenusLastMonth._sum.montant || 1)) * 100)
                    : 100,
            },
            evolutionMois,
            parVille,
        });
    } catch (error) {
        console.error('[getStats]', error);
        return res.status(500).json({ error: 'Erreur serveur' });
    }
};

// ─── GESTION UTILISATEURS ────────────────────────────────────────────────────
export const getUtilisateurs = async (req: Request, res: Response) => {
    try {
        const { page = '1', limit = '20', search = '', typeCompte = '' } = req.query;
        const skip = (Number(page) - 1) * Number(limit);

        const where: any = {};
        if (search) {
            where.OR = [
                { nom: { contains: String(search), mode: 'insensitive' } },
                { prenom: { contains: String(search), mode: 'insensitive' } },
                { email: { contains: String(search), mode: 'insensitive' } },
            ];
        }
        if (typeCompte) where.typeCompte = typeCompte;

        const [users, total] = await Promise.all([
            prisma.utilisateur.findMany({
                where,
                select: {
                    id: true,
                    nom: true,
                    prenom: true,
                    email: true,
                    telephone: true,
                    ville: true,
                    typeCompte: true,
                    photo: true,
                    emailVerifie: true,
                    actif: true,
                    createdAt: true,
                    _count: { select: { annonces: true, colocataires: true } },
                    abonnements: {
                        where: { statut: 'ACTIF', periodeFin: { gte: new Date() } },
                        select: { statut: true, periodeFin: true },
                        take: 1,
                    },
                },
                orderBy: { createdAt: 'desc' },
                skip,
                take: Number(limit),
            }),
            prisma.utilisateur.count({ where }),
        ]);

        return res.json({ users, total, pages: Math.ceil(total / Number(limit)) });
    } catch (error) {
        console.error('[getUtilisateurs]', error);
        return res.status(500).json({ error: 'Erreur serveur' });
    }
};

export const toggleUserActif = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const user = await prisma.utilisateur.findUnique({ where: { id } });
        if (!user) return res.status(404).json({ error: 'Utilisateur introuvable' });

        const updated = await prisma.utilisateur.update({
            where: { id },
            data: { actif: !user.actif },
            select: { id: true, actif: true },
        });
        return res.json(updated);
    } catch (error) {
        console.error('[toggleUserActif]', error);
        return res.status(500).json({ error: 'Erreur serveur' });
    }
};

export const deleteUser = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        await prisma.utilisateur.delete({ where: { id } });
        return res.json({ message: 'Utilisateur supprimé' });
    } catch (error) {
        console.error('[deleteUser]', error);
        return res.status(500).json({ error: 'Erreur serveur' });
    }
};

export const promouvoirAdmin = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const updated = await prisma.utilisateur.update({
            where: { id },
            data: { typeCompte: 'ADMIN' },
            select: { id: true, typeCompte: true },
        });
        return res.json(updated);
    } catch (error) {
        console.error('[promouvoirAdmin]', error);
        return res.status(500).json({ error: 'Erreur serveur' });
    }
};

// ─── GESTION ANNONCES ────────────────────────────────────────────────────────
export const getAnnonces = async (req: Request, res: Response) => {
    try {
        const { page = '1', limit = '20', search = '', statut = '' } = req.query;
        const skip = (Number(page) - 1) * Number(limit);

        const where: any = {};
        if (search) {
            where.OR = [
                { ville: { contains: String(search), mode: 'insensitive' } },
                { description: { contains: String(search), mode: 'insensitive' } },
                { adresse: { contains: String(search), mode: 'insensitive' } },
            ];
        }
        if (statut) where.statut = statut;

        const [annonces, total] = await Promise.all([
            prisma.annonce.findMany({
                where,
                include: {
                    proprietaire: { select: { id: true, nom: true, prenom: true, email: true, photo: true } },
                },
                orderBy: { createdAt: 'desc' },
                skip,
                take: Number(limit),
            }),
            prisma.annonce.count({ where }),
        ]);

        return res.json({ annonces, total, pages: Math.ceil(total / Number(limit)) });
    } catch (error) {
        console.error('[getAnnonces]', error);
        return res.status(500).json({ error: 'Erreur serveur' });
    }
};

export const updateAnnonceStatut = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { statut } = req.body;
        const updated = await prisma.annonce.update({
            where: { id },
            data: { statut },
        });
        return res.json(updated);
    } catch (error) {
        console.error('[updateAnnonceStatut]', error);
        return res.status(500).json({ error: 'Erreur serveur' });
    }
};

export const deleteAnnonce = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        await prisma.annonce.update({ where: { id }, data: { statut: 'SUPPRIMEE' } });
        return res.json({ message: 'Annonce supprimée' });
    } catch (error) {
        console.error('[deleteAnnonce]', error);
        return res.status(500).json({ error: 'Erreur serveur' });
    }
};

// ─── GESTION ABONNEMENTS ─────────────────────────────────────────────────────
export const getAbonnements = async (req: Request, res: Response) => {
    try {
        const { page = '1', limit = '20', statut = '' } = req.query;
        const skip = (Number(page) - 1) * Number(limit);

        const where: any = {};
        if (statut) where.statut = statut;

        const [abonnements, total] = await Promise.all([
            prisma.abonnement.findMany({
                where,
                include: {
                    utilisateur: { select: { id: true, nom: true, prenom: true, email: true, photo: true } },
                },
                orderBy: { createdAt: 'desc' },
                skip,
                take: Number(limit),
            }),
            prisma.abonnement.count({ where }),
        ]);

        return res.json({ abonnements, total, pages: Math.ceil(total / Number(limit)) });
    } catch (error) {
        console.error('[getAbonnements]', error);
        return res.status(500).json({ error: 'Erreur serveur' });
    }
};

export const updateAbonnementStatut = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { statut } = req.body;
        const updated = await prisma.abonnement.update({ where: { id }, data: { statut } });
        return res.json(updated);
    } catch (error) {
        console.error('[updateAbonnementStatut]', error);
        return res.status(500).json({ error: 'Erreur serveur' });
    }
};

// ─── ACTIVITE RECENTE ────────────────────────────────────────────────────────
export const getActiviteRecente = async (req: Request, res: Response) => {
    try {
        const [recentUsers, recentAnnonces, recentAbonnements, recentColocations] = await Promise.all([
            prisma.utilisateur.findMany({
                take: 5,
                orderBy: { createdAt: 'desc' },
                select: { id: true, nom: true, prenom: true, email: true, photo: true, createdAt: true, typeCompte: true },
            }),
            prisma.annonce.findMany({
                take: 5,
                orderBy: { createdAt: 'desc' },
                include: { proprietaire: { select: { nom: true, prenom: true } } },
            }),
            prisma.abonnement.findMany({
                take: 5,
                orderBy: { createdAt: 'desc' },
                include: { utilisateur: { select: { nom: true, prenom: true } } },
            }),
            prisma.colocation.findMany({
                take: 5,
                orderBy: { createdAt: 'desc' },
                include: { colocataires: { include: { utilisateur: { select: { nom: true, prenom: true } } } } },
            }),
        ]);

        return res.json({ recentUsers, recentAnnonces, recentAbonnements, recentColocations });
    } catch (error) {
        console.error('[getActiviteRecente]', error);
        return res.status(500).json({ error: 'Erreur serveur' });
    }
};