import { Router } from 'express';
import { Response } from 'express';
import multer from 'multer';
import path from 'path';
import { authenticate } from '../../middlewares/auth.middleware';
import { AuthRequest } from '../../middlewares/auth.middleware';
import { prisma } from '../../config/database';

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, process.env.UPLOAD_DIR || './uploads'),
  filename: (_req, file, cb) => cb(null, `avatar-${Date.now()}${path.extname(file.originalname)}`),
});
const upload = multer({ storage, limits: { fileSize: 2 * 1024 * 1024 } });

export const usersRouter = Router();
usersRouter.use(authenticate);

// GET /api/users/recherche — chercher des colocataires
usersRouter.get('/recherche', async (req: AuthRequest, res: Response) => {
  try {
    const { ville, universite, niveau } = req.query;
    const where: any = { typeCompte: 'ETUDIANT', actif: true, emailVerifie: true };
    if (ville) where.ville = { contains: String(ville), mode: 'insensitive' };
    if (universite) where.universite = { contains: String(universite), mode: 'insensitive' };
    if (niveau) where.niveau = String(niveau);

    const users = await prisma.utilisateur.findMany({
      where,
      select: {
        id: true, nom: true, prenom: true, photo: true,
        ville: true, universite: true, niveau: true, filiere: true,
      },
      take: 30,
    });

    return res.json(users);
  } catch (error) {
    console.error('[recherche]', error);
    return res.status(500).json({ error: 'Erreur serveur lors de la recherche' });
  }
});

// PUT /api/users/me — modifier son profil (avant /:id pour éviter un conflit de routes)
usersRouter.put('/me', async (req: AuthRequest, res: Response) => {
  try {
    const { nom, prenom, telephone, ville, universite, filiere, niveau } = req.body;
    const updated = await prisma.utilisateur.update({
      where: { id: req.user!.id },
      data: { nom, prenom, telephone, ville, universite, filiere, niveau },
      select: {
        id: true, nom: true, prenom: true, email: true,
        telephone: true, ville: true, universite: true, niveau: true, photo: true,
      },
    });
    return res.json(updated);
  } catch (error) {
    console.error('[updateMe]', error);
    return res.status(500).json({ error: 'Erreur serveur lors de la mise à jour du profil' });
  }
});

// POST /api/users/me/photo — upload avatar
usersRouter.post('/me/photo', upload.single('photo'), async (req: AuthRequest, res: Response) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'Aucun fichier' });
    const photoUrl = `/uploads/${req.file.filename}`;
    await prisma.utilisateur.update({ where: { id: req.user!.id }, data: { photo: photoUrl } });
    return res.json({ photo: photoUrl });
  } catch (error) {
    console.error('[uploadPhoto]', error);
    return res.status(500).json({ error: "Erreur serveur lors de l'upload de la photo" });
  }
});

// GET /api/users/:id — profil public (après /me pour éviter les conflits)
usersRouter.get('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const user = await prisma.utilisateur.findUnique({
      where: { id: req.params.id },
      select: {
        id: true, nom: true, prenom: true, photo: true,
        ville: true, universite: true, niveau: true, filiere: true, createdAt: true,
      },
    });
    if (!user) return res.status(404).json({ error: 'Utilisateur introuvable' });
    return res.json(user);
  } catch (error) {
    console.error('[getUser]', error);
    return res.status(500).json({ error: "Erreur serveur lors de la récupération de l'utilisateur" });
  }
});