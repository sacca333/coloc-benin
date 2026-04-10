import { Router } from 'express';
import { authenticate, requireAbonnementActif } from '../../middlewares/auth.middleware';
import { prisma } from '../../config/database';
import { AuthRequest } from '../../middlewares/auth.middleware';

export const messagerieRouter = Router();
messagerieRouter.use(authenticate);

// GET /api/messagerie/conversations
messagerieRouter.get('/conversations', async (req: AuthRequest, res) => {
  const userId = req.user!.id;

  // Récupérer les derniers messages par conversation (une ligne par interlocuteur)
  const messages = await prisma.message.findMany({
    where: { OR: [{ expediteurId: userId }, { destinataireId: userId }] },
    include: {
      expediteur: { select: { id: true, nom: true, prenom: true, photo: true } },
      destinataire: { select: { id: true, nom: true, prenom: true, photo: true } },
    },
    orderBy: { createdAt: 'desc' },
  });

  // Grouper par interlocuteur et ne garder que le dernier message
  const convMap = new Map<string, any>();
  for (const msg of messages) {
    const interlocuteurId = msg.expediteurId === userId ? msg.destinataireId : msg.expediteurId;
    if (!convMap.has(interlocuteurId)) {
      convMap.set(interlocuteurId, {
        interlocuteur: msg.expediteurId === userId ? msg.destinataire : msg.expediteur,
        dernierMessage: { contenu: msg.contenu, createdAt: msg.createdAt, lu: msg.lu },
        nonLus: 0,
      });
    }
    if (!msg.lu && msg.destinataireId === userId) {
      convMap.get(interlocuteurId).nonLus++;
    }
  }

  res.json([...convMap.values()]);
});

// GET /api/messagerie/:userId — fil de messages avec un utilisateur
messagerieRouter.get('/:userId', async (req: AuthRequest, res) => {
  const userId = req.user!.id;
  const otherId = req.params.userId;

  const messages = await prisma.message.findMany({
    where: {
      OR: [
        { expediteurId: userId, destinataireId: otherId },
        { expediteurId: otherId, destinataireId: userId },
      ],
    },
    include: {
      expediteur: { select: { id: true, nom: true, prenom: true, photo: true } },
    },
    orderBy: { createdAt: 'asc' },
  });

  // Marquer les messages reçus comme lus
  await prisma.message.updateMany({
    where: { expediteurId: otherId, destinataireId: userId, lu: false },
    data: { lu: true },
  });

  res.json(messages);
});

// POST /api/messagerie/:userId — envoyer un message
messagerieRouter.post('/:userId', requireAbonnementActif, async (req: AuthRequest, res) => {
  const { contenu } = req.body;
  if (!contenu?.trim()) return res.status(400).json({ error: 'Message vide' });

  const destinataire = await prisma.utilisateur.findUnique({ where: { id: req.params.userId } });
  if (!destinataire || !destinataire.actif) return res.status(404).json({ error: 'Destinataire introuvable' });

  const message = await prisma.message.create({
    data: {
      expediteurId: req.user!.id,
      destinataireId: req.params.userId,
      contenu: contenu.trim(),
    },
    include: {
      expediteur: { select: { id: true, nom: true, prenom: true, photo: true } },
    },
  });

  res.status(201).json(message);
});

// PATCH /api/messagerie/lu/:messageId
messagerieRouter.patch('/lu/:messageId', async (req: AuthRequest, res) => {
  await prisma.message.updateMany({
    where: { id: req.params.messageId, destinataireId: req.user!.id },
    data: { lu: true },
  });
  res.json({ ok: true });
});
