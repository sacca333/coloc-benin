import { Router } from 'express';
import { authenticate, requireAbonnementActif } from '../../middlewares/auth.middleware';
import { prisma } from '../../config/database';
import { AuthRequest } from '../../middlewares/auth.middleware';
import multer from 'multer';
import path from 'path';

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, process.env.UPLOAD_DIR || './uploads'),
  filename: (_req, file, cb) => cb(null, `msg-${Date.now()}${path.extname(file.originalname)}`),
});
const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const allowed = ['.jpg', '.jpeg', '.png', '.webp', '.gif', '.mp4', '.mov'];
    if (allowed.includes(path.extname(file.originalname).toLowerCase())) cb(null, true);
    else cb(new Error('Format non supporte') as any, false);
  },
});

export const messagerieRouter = Router();
messagerieRouter.use(authenticate);

// GET /api/messagerie/conversations
messagerieRouter.get('/conversations', async (req: AuthRequest, res) => {
  try {
    const userId = req.user!.id;
    const messages = await prisma.message.findMany({
      where: { OR: [{ expediteurId: userId }, { destinataireId: userId }] },
      include: {
        expediteur: { select: { id: true, nom: true, prenom: true, photo: true } },
        destinataire: { select: { id: true, nom: true, prenom: true, photo: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
    const convMap = new Map<string, any>();
    for (const msg of messages) {
      const interlocuteurId = msg.expediteurId === userId ? msg.destinataireId : msg.expediteurId;
      if (!convMap.has(interlocuteurId)) {
        convMap.set(interlocuteurId, {
          interlocuteur: msg.expediteurId === userId ? msg.destinataire : msg.expediteur,
          dernierMessage: { contenu: msg.contenu, media: msg.media, createdAt: msg.createdAt, lu: msg.lu },
          nonLus: 0,
        });
      }
      if (!msg.lu && msg.destinataireId === userId) {
        convMap.get(interlocuteurId).nonLus++;
      }
    }
    return res.json([...convMap.values()]);
  } catch (error) {
    console.error('[conversations]', error);
    return res.status(500).json({ error: 'Erreur serveur' });
  }
});

// GET /api/messagerie/:userId
messagerieRouter.get('/:userId', async (req: AuthRequest, res) => {
  try {
    const userId = req.user!.id;
    const otherId = req.params.userId;
    const messages = await prisma.message.findMany({
      where: {
        OR: [
          { expediteurId: userId, destinataireId: otherId },
          { expediteurId: otherId, destinataireId: userId },
        ],
      },
      include: { expediteur: { select: { id: true, nom: true, prenom: true, photo: true } } },
      orderBy: { createdAt: 'asc' },
    });
    await prisma.message.updateMany({
      where: { expediteurId: otherId, destinataireId: userId, lu: false },
      data: { lu: true },
    });
    return res.json(messages);
  } catch (error) {
    console.error('[getMessages]', error);
    return res.status(500).json({ error: 'Erreur serveur' });
  }
});

// POST /api/messagerie/:userId — texte
messagerieRouter.post('/:userId', requireAbonnementActif, async (req: AuthRequest, res) => {
  try {
    const { contenu } = req.body;
    if (!contenu?.trim()) return res.status(400).json({ error: 'Message vide' });
    const destinataire = await prisma.utilisateur.findUnique({ where: { id: req.params.userId } });
    if (!destinataire || !destinataire.actif) return res.status(404).json({ error: 'Destinataire introuvable' });
    const message = await prisma.message.create({
      data: { expediteurId: req.user!.id, destinataireId: req.params.userId, contenu: contenu.trim() },
      include: { expediteur: { select: { id: true, nom: true, prenom: true, photo: true } } },
    });
    return res.status(201).json(message);
  } catch (error) {
    console.error('[envoyerMessage]', error);
    return res.status(500).json({ error: 'Erreur serveur' });
  }
});

// POST /api/messagerie/:userId/media — photo/video
messagerieRouter.post('/:userId/media', requireAbonnementActif, upload.single('media'), async (req: AuthRequest, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'Aucun fichier' });
    const destinataire = await prisma.utilisateur.findUnique({ where: { id: req.params.userId } });
    if (!destinataire || !destinataire.actif) return res.status(404).json({ error: 'Destinataire introuvable' });
    const mediaUrl = `/uploads/${req.file.filename}`;
    const isVideo = ['.mp4', '.mov'].includes(path.extname(req.file.originalname).toLowerCase());
    const message = await prisma.message.create({
      data: {
        expediteurId: req.user!.id,
        destinataireId: req.params.userId,
        contenu: isVideo ? '🎥 Video' : '📷 Photo',
        media: mediaUrl,
      },
      include: { expediteur: { select: { id: true, nom: true, prenom: true, photo: true } } },
    });
    return res.status(201).json(message);
  } catch (error) {
    console.error('[envoyerMedia]', error);
    return res.status(500).json({ error: 'Erreur serveur lors de l envoi du media' });
  }
});

// PATCH /api/messagerie/lu/:messageId
messagerieRouter.patch('/lu/:messageId', async (req: AuthRequest, res) => {
  try {
    await prisma.message.updateMany({
      where: { id: req.params.messageId, destinataireId: req.user!.id },
      data: { lu: true },
    });
    return res.json({ ok: true });
  } catch (error) {
    console.error('[marquerLu]', error);
    return res.status(500).json({ error: 'Erreur serveur' });
  }
});
