import { Router } from 'express';
import { authenticate, requireAdmin, AuthRequest } from '../../middlewares/auth.middleware';
import { prisma } from '../../config/database';

export const adminRouter = Router();
adminRouter.use(authenticate, requireAdmin);

// ─── STATS ───────────────────────────────────────────────────────────────────
adminRouter.get('/stats', async (_req, res) => {
  try {
    const now = new Date();
    const debutMois = new Date(now.getFullYear(), now.getMonth(), 1);
    const debutMoisDernier = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const finMoisDernier = new Date(now.getFullYear(), now.getMonth(), 0);

    const [
      totalUsers, newUsersThisMonth, newUsersLastMonth,
      totalAnnonces, annoncesActives,
      totalColocations, colocationsActives,
      abonnementsActifs, abonnementsThisMonth, abonnementsLastMonth,
      totalDemandes, demandesAcceptees,
    ] = await Promise.all([
      prisma.utilisateur.count({ where: { actif: true } }),
      prisma.utilisateur.count({ where: { createdAt: { gte: debutMois } } }),
      prisma.utilisateur.count({ where: { createdAt: { gte: debutMoisDernier, lte: finMoisDernier } } }),
      prisma.annonce.count(),
      prisma.annonce.count({ where: { statut: 'ACTIVE' } }),
      prisma.colocation.count(),
      prisma.colocation.count({ where: { statut: 'ACTIVE' } }),
      prisma.abonnement.count({ where: { statut: 'ACTIF', periodeFin: { gte: now } } }),
      prisma.abonnement.count({ where: { statut: 'ACTIF', createdAt: { gte: debutMois } } }),
      prisma.abonnement.count({ where: { statut: 'ACTIF', createdAt: { gte: debutMoisDernier, lte: finMoisDernier } } }),
      prisma.demandeColocation.count().catch(() => 0),
      prisma.demandeColocation.count({ where: { statut: 'ACCEPTEE' } }).catch(() => 0),
    ]);

    const [revenus, revenusThisMonth, revenusLastMonth, parVille, annonceParType] = await Promise.all([
      prisma.abonnement.aggregate({ _sum: { montant: true }, where: { statut: 'ACTIF' } }),
      prisma.abonnement.aggregate({ _sum: { montant: true }, where: { statut: 'ACTIF', createdAt: { gte: debutMois } } }),
      prisma.abonnement.aggregate({ _sum: { montant: true }, where: { statut: 'ACTIF', createdAt: { gte: debutMoisDernier, lte: finMoisDernier } } }),
      prisma.utilisateur.groupBy({ by: ['ville'], _count: true, orderBy: { _count: { ville: 'desc' } }, take: 5, where: { ville: { not: null } } }),
      prisma.annonce.groupBy({ by: ['type'], _count: true }),
    ]);

    adminRouter.get('/activite', async (_req, res) => {
      try {
        const [recentUsers, recentAnnonces, recentAbonnements] = await Promise.all([
          prisma.utilisateur.findMany({
            take: 5, orderBy: { createdAt: 'desc' },
            select: { id: true, nom: true, prenom: true, email: true, photo: true, createdAt: true, typeCompte: true },
          }),
          prisma.annonce.findMany({
            take: 5, orderBy: { createdAt: 'desc' },
            include: { proprietaire: { select: { nom: true, prenom: true } } },
          }),
          prisma.abonnement.findMany({
            take: 5, orderBy: { createdAt: 'desc' },
            include: { utilisateur: { select: { nom: true, prenom: true, photo: true } } },
          }),
        ]);
        res.json({ recentUsers, recentAnnonces, recentAbonnements });
      } catch (error) {
        console.error('[admin/activite]', error);
        res.status(500).json({ error: 'Erreur serveur' });
      }
    });

    adminRouter.get('/activite', async (_req, res) => {
      try {
        const [recentUsers, recentAnnonces, recentAbonnements] = await Promise.all([
          prisma.utilisateur.findMany({
            take: 5, orderBy: { createdAt: 'desc' },
            select: { id: true, nom: true, prenom: true, email: true, photo: true, createdAt: true, typeCompte: true },
          }),
          prisma.annonce.findMany({
            take: 5, orderBy: { createdAt: 'desc' },
            include: { proprietaire: { select: { nom: true, prenom: true } } },
          }),
          prisma.abonnement.findMany({
            take: 5, orderBy: { createdAt: 'desc' },
            include: { utilisateur: { select: { nom: true, prenom: true, photo: true } } },
          }),
        ]);
        res.json({ recentUsers, recentAnnonces, recentAbonnements });
      } catch (error) {
        console.error('[admin/activite]', error);
        res.status(500).json({ error: 'Erreur serveur' });
      }
    });

    // Évolution 6 mois
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
        users, abonnements: abos, revenus: abos * 300,
      });
    }

    res.json({
      utilisateurs: {
        total: totalUsers,
        nouveauxCeMois: newUsersThisMonth,
        nouveauxMoisDernier: newUsersLastMonth,
        evolution: newUsersLastMonth > 0 ? Math.round(((newUsersThisMonth - newUsersLastMonth) / newUsersLastMonth) * 100) : 100,
      },
      annonces: { total: totalAnnonces, actives: annoncesActives, parType: annonceParType },
      colocations: {
        total: totalColocations, actives: colocationsActives,
        tauxSucces: totalDemandes > 0 ? Math.round((demandesAcceptees / totalDemandes) * 100) : 0,
      },
      abonnements: {
        actifs: abonnementsActifs, ceMois: abonnementsThisMonth, moisDernier: abonnementsLastMonth,
        evolution: abonnementsLastMonth > 0 ? Math.round(((abonnementsThisMonth - abonnementsLastMonth) / abonnementsLastMonth) * 100) : 100,
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
    console.error('[admin/stats]', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// ─── ACTIVITE RECENTE ────────────────────────────────────────────────────────
adminRouter.get('/activite', async (_req, res) => {
  try {
    const [recentUsers, recentAnnonces, recentAbonnements] = await Promise.all([
      prisma.utilisateur.findMany({
        take: 5, orderBy: { createdAt: 'desc' },
        select: { id: true, nom: true, prenom: true, email: true, photo: true, createdAt: true, typeCompte: true },
      }),
      prisma.annonce.findMany({
        take: 5, orderBy: { createdAt: 'desc' },
        include: { proprietaire: { select: { nom: true, prenom: true } } },
      }),
      prisma.abonnement.findMany({
        take: 5, orderBy: { createdAt: 'desc' },
        include: { utilisateur: { select: { nom: true, prenom: true, photo: true } } },
      }),
    ]);
    res.json({ recentUsers, recentAnnonces, recentAbonnements });
  } catch (error) {
    console.error('[admin/activite]', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// ─── UTILISATEURS ────────────────────────────────────────────────────────────
adminRouter.get('/utilisateurs', async (req, res) => {
  try {
    const { page = '1', limit = '20', search = '', typeCompte = '', actif } = req.query;
    const skip = (Number(page) - 1) * Number(limit);
    const where: any = {};
    if (search) where.OR = [
      { nom: { contains: String(search), mode: 'insensitive' } },
      { prenom: { contains: String(search), mode: 'insensitive' } },
      { email: { contains: String(search), mode: 'insensitive' } },
    ];
    if (typeCompte) where.typeCompte = typeCompte;
    if (actif !== undefined) where.actif = actif === 'true';

    const [users, total] = await Promise.all([
      prisma.utilisateur.findMany({
        where,
        select: {
          id: true, nom: true, prenom: true, email: true, telephone: true,
          ville: true, typeCompte: true, photo: true, emailVerifie: true, actif: true, createdAt: true,
          _count: { select: { annonces: true, colocataires: true } },
          abonnements: { where: { statut: 'ACTIF', periodeFin: { gte: new Date() } }, select: { statut: true, periodeFin: true }, take: 1 },
        },
        orderBy: { createdAt: 'desc' },
        skip, take: Number(limit),
      }),
      prisma.utilisateur.count({ where }),
    ]);
    res.json({ users, total, pages: Math.ceil(total / Number(limit)) });
  } catch (error) {
    console.error('[admin/utilisateurs]', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

adminRouter.patch('/utilisateurs/:id/statut', async (req: AuthRequest, res) => {
  try {
    const { actif } = req.body;
    await prisma.utilisateur.update({ where: { id: req.params.id }, data: { actif } });
    res.json({ message: actif ? 'Compte activé' : 'Compte suspendu' });
  } catch (error) {
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

adminRouter.put('/utilisateurs/:id/actif', async (req, res) => {
  try {
    const user = await prisma.utilisateur.findUnique({ where: { id: req.params.id } });
    if (!user) return res.status(404).json({ error: 'Introuvable' });
    const updated = await prisma.utilisateur.update({ where: { id: req.params.id }, data: { actif: !user.actif } });
    res.json({ id: updated.id, actif: updated.actif });
  } catch (error) {
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

adminRouter.put('/utilisateurs/:id/promouvoir', async (req, res) => {
  try {
    const updated = await prisma.utilisateur.update({ where: { id: req.params.id }, data: { typeCompte: 'ADMIN' } });
    res.json({ id: updated.id, typeCompte: updated.typeCompte });
  } catch (error) {
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

adminRouter.delete('/utilisateurs/:id', async (req, res) => {
  try {
    await prisma.utilisateur.delete({ where: { id: req.params.id } });
    res.json({ message: 'Utilisateur supprimé' });
  } catch (error) {
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// ─── ANNONCES ────────────────────────────────────────────────────────────────
adminRouter.get('/annonces', async (req, res) => {
  try {
    const { page = '1', limit = '20', search = '', statut = '' } = req.query;
    const skip = (Number(page) - 1) * Number(limit);
    const where: any = {};
    if (search) where.OR = [
      { ville: { contains: String(search), mode: 'insensitive' } },
      { description: { contains: String(search), mode: 'insensitive' } },
    ];
    if (statut) where.statut = statut;

    const [annonces, total] = await Promise.all([
      prisma.annonce.findMany({
        where,
        include: { proprietaire: { select: { id: true, nom: true, prenom: true, email: true, photo: true } } },
        orderBy: { createdAt: 'desc' },
        skip, take: Number(limit),
      }),
      prisma.annonce.count({ where }),
    ]);
    res.json({ annonces, total, pages: Math.ceil(total / Number(limit)) });
  } catch (error) {
    console.error('[admin/annonces]', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

adminRouter.patch('/annonces/:id/statut', async (req, res) => {
  try {
    const { statut } = req.body;
    await prisma.annonce.update({ where: { id: req.params.id }, data: { statut } });
    res.json({ message: 'Statut mis à jour' });
  } catch (error) {
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

adminRouter.put('/annonces/:id/statut', async (req, res) => {
  try {
    const { statut } = req.body;
    const updated = await prisma.annonce.update({ where: { id: req.params.id }, data: { statut } });
    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

adminRouter.delete('/annonces/:id', async (req, res) => {
  try {
    await prisma.annonce.update({ where: { id: req.params.id }, data: { statut: 'SUPPRIMEE' } });
    res.json({ message: 'Annonce supprimée' });
  } catch (error) {
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// ─── ABONNEMENTS ─────────────────────────────────────────────────────────────
adminRouter.get('/abonnements', async (req, res) => {
  try {
    const { page = '1', limit = '20', statut = '', operateur = '' } = req.query;
    const skip = (Number(page) - 1) * Number(limit);
    const where: any = {};
    if (statut) where.statut = statut;
    if (operateur) where.operateur = operateur;

    const [abonnements, total] = await Promise.all([
      prisma.abonnement.findMany({
        where,
        include: { utilisateur: { select: { id: true, nom: true, prenom: true, email: true, photo: true } } },
        orderBy: { createdAt: 'desc' },
        skip, take: Number(limit),
      }),
      prisma.abonnement.count({ where }),
    ]);
    res.json({ abonnements, total, pages: Math.ceil(total / Number(limit)) });
  } catch (error) {
    console.error('[admin/abonnements]', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

adminRouter.put('/abonnements/:id/statut', async (req, res) => {
  try {
    const { statut } = req.body;
    const updated = await prisma.abonnement.update({ where: { id: req.params.id }, data: { statut } });
    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// ─── EXPORT CSV ──────────────────────────────────────────────────────────────
adminRouter.get('/abonnements/export', async (_req, res) => {
  try {
    const abonnements = await prisma.abonnement.findMany({
      include: { utilisateur: { select: { nom: true, prenom: true, email: true } } },
      orderBy: { createdAt: 'desc' },
    });
    const header = 'Nom,Prénom,Email,Opérateur,Montant,Statut,Début,Fin\n';
    const rows = abonnements.map(a =>
      `${a.utilisateur.nom},${a.utilisateur.prenom},${a.utilisateur.email},${a.operateur},${a.montant},${a.statut},${a.periodeDebut?.toISOString() || ''},${a.periodeFin?.toISOString() || ''}`
    ).join('\n');
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename=abonnements-${Date.now()}.csv`);
    res.send('\uFEFF' + header + rows);
  } catch (error) {
    res.status(500).json({ error: 'Erreur serveur' });
  }
});