import { Router, Response } from 'express';
import { authenticate, requireAdmin, AuthRequest } from '../../middlewares/auth.middleware';
import { prisma } from '../../config/database';

export const adminRouter = Router();
adminRouter.use(authenticate, requireAdmin);

// GET /api/admin/stats — dashboard global
adminRouter.get('/stats', async (_req, res) => {
  const [
    totalUtilisateurs,
    abonnementsActifs,
    colocationsActives,
    annoncesActives,
    revenusTotal,
    parVille,
  ] = await Promise.all([
    prisma.utilisateur.count({ where: { actif: true } }),
    prisma.abonnement.count({ where: { statut: 'ACTIF', periodeFin: { gte: new Date() } } }),
    prisma.colocation.count({ where: { statut: 'ACTIVE' } }),
    prisma.annonce.count({ where: { statut: 'ACTIVE' } }),
    prisma.abonnement.aggregate({ where: { statut: 'ACTIF' }, _sum: { montant: true } }),
    prisma.utilisateur.groupBy({ by: ['ville'], _count: { id: true }, orderBy: { _count: { id: 'desc' } }, take: 5 }),
  ]);

  res.json({
    totalUtilisateurs,
    abonnementsActifs,
    colocationsActives,
    annoncesActives,
    revenusTotal: revenusTotal._sum.montant || 0,
    topVilles: parVille.map(v => ({ ville: v.ville, count: v._count.id })),
  });
});

// GET /api/admin/utilisateurs — liste avec filtres
adminRouter.get('/utilisateurs', async (req, res) => {
  const { email, telephone, ville, actif, page = '1' } = req.query;
  const where: any = {};
  if (email) where.email = { contains: String(email), mode: 'insensitive' };
  if (telephone) where.telephone = { contains: String(telephone) };
  if (ville) where.ville = { contains: String(ville), mode: 'insensitive' };
  if (actif !== undefined) where.actif = actif === 'true';

  const skip = (Number(page) - 1) * 20;
  const [total, utilisateurs] = await Promise.all([
    prisma.utilisateur.count({ where }),
    prisma.utilisateur.findMany({
      where,
      select: { id: true, nom: true, prenom: true, email: true, telephone: true, ville: true, typeCompte: true, actif: true, createdAt: true },
      orderBy: { createdAt: 'desc' },
      skip,
      take: 20,
    }),
  ]);

  res.json({ total, page: Number(page), utilisateurs });
});

// PATCH /api/admin/utilisateurs/:id/statut
adminRouter.patch('/utilisateurs/:id/statut', async (req: AuthRequest, res) => {
  const { actif } = req.body;
  await prisma.utilisateur.update({ where: { id: req.params.id }, data: { actif } });
  res.json({ message: actif ? 'Compte activé' : 'Compte suspendu' });
});

// GET /api/admin/annonces — modération
adminRouter.get('/annonces', async (req, res) => {
  const { statut = 'ACTIVE' } = req.query;
  const annonces = await prisma.annonce.findMany({
    where: { statut: String(statut) as any },
    include: { proprietaire: { select: { nom: true, prenom: true, email: true } } },
    orderBy: { createdAt: 'desc' },
    take: 50,
  });
  res.json(annonces);
});

// PATCH /api/admin/annonces/:id/statut
adminRouter.patch('/annonces/:id/statut', async (req, res) => {
  const { statut } = req.body;
  await prisma.annonce.update({ where: { id: req.params.id }, data: { statut } });
  res.json({ message: 'Statut mis à jour' });
});

// GET /api/admin/abonnements — tableau des paiements
adminRouter.get('/abonnements', async (req, res) => {
  const { statut, operateur, page = '1' } = req.query;
  const where: any = {};
  if (statut) where.statut = String(statut);
  if (operateur) where.operateur = String(operateur);

  const skip = (Number(page) - 1) * 30;
  const [total, abonnements] = await Promise.all([
    prisma.abonnement.count({ where }),
    prisma.abonnement.findMany({
      where,
      include: { utilisateur: { select: { nom: true, prenom: true, email: true } } },
      orderBy: { createdAt: 'desc' },
      skip,
      take: 30,
    }),
  ]);

  res.json({ total, page: Number(page), abonnements });
});

// GET /api/admin/abonnements/export — CSV
adminRouter.get('/abonnements/export', async (_req, res) => {
  const abonnements = await prisma.abonnement.findMany({
    include: { utilisateur: { select: { nom: true, prenom: true, email: true } } },
    orderBy: { createdAt: 'desc' },
  });

  const header = 'Nom,Prénom,Email,Opérateur,Montant,Statut,Date paiement,Début,Fin\n';
  const rows = abonnements.map(a =>
    `${a.utilisateur.nom},${a.utilisateur.prenom},${a.utilisateur.email},${a.operateur},${a.montant},${a.statut},${a.datePaiement?.toISOString() || ''},${a.periodeDebut?.toISOString() || ''},${a.periodeFin?.toISOString() || ''}`
  ).join('\n');

  res.setHeader('Content-Type', 'text/csv; charset=utf-8');
  res.setHeader('Content-Disposition', `attachment; filename=abonnements-${Date.now()}.csv`);
  res.send('\uFEFF' + header + rows); // BOM UTF-8 pour Excel
});
