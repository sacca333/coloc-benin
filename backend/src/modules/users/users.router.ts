import { Router } from 'express';
import { Response } from 'express';
import multer from 'multer';
import path from 'path';
import bcrypt from 'bcrypt';
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

usersRouter.get('/recherche', async (req: AuthRequest, res: Response) => {
  try {
    const { ville, universite, niveau } = req.query;
    const where: any = { typeCompte: 'ETUDIANT', actif: true, emailVerifie: true };
    if (ville) where.ville = { contains: String(ville), mode: 'insensitive' };
    if (universite) where.universite = { contains: String(universite), mode: 'insensitive' };
    if (niveau) where.niveau = String(niveau);
    const users = await prisma.utilisateur.findMany({
      where,
      select: { id: true, nom: true, prenom: true, photo: true, ville: true, universite: true, niveau: true, filiere: true },
      take: 30,
    });
    return res.json(users);
  } catch (error) {
    console.error('[recherche]', error);
    return res.status(500).json({ error: 'Erreur serveur lors de la recherche' });
  }
});

usersRouter.put('/me', async (req: AuthRequest, res: Response) => {
  try {
    const { nom, prenom, telephone, ville, universite, filiere, niveau } = req.body;
    const updated = await prisma.utilisateur.update({
      where: { id: req.user!.id },
      data: { nom, prenom, telephone, ville, universite, filiere, niveau },
      select: { id: true, nom: true, prenom: true, email: true, telephone: true, ville: true, universite: true, niveau: true, photo: true },
    });
    return res.json(updated);
  } catch (error) {
    console.error('[updateMe]', error);
    return res.status(500).json({ error: 'Erreur serveur lors de la mise a jour du profil' });
  }
});

usersRouter.put('/me/password', async (req: AuthRequest, res: Response) => {
  try {
    const { ancienMotDePasse, nouveauMotDePasse } = req.body;
    if (!ancienMotDePasse || !nouveauMotDePasse) {
      return res.status(400).json({ error: 'Les deux mots de passe sont requis' });
    }
    if (nouveauMotDePasse.length < 8) {
      return res.status(400).json({ error: 'Le nouveau mot de passe doit contenir au moins 8 caracteres' });
    }
    const user = await prisma.utilisateur.findUnique({ where: { id: req.user!.id } });
    if (!user) return res.status(404).json({ error: 'Utilisateur introuvable' });
    const valide = await bcrypt.compare(ancienMotDePasse, user.motDePasse);
    if (!valide) return res.status(401).json({ error: 'Ancien mot de passe incorrect' });
    const hash = await bcrypt.hash(nouveauMotDePasse, 12);
    await prisma.utilisateur.update({ where: { id: req.user!.id }, data: { motDePasse: hash } });
    return res.json({ message: 'Mot de passe modifie avec succes' });
  } catch (error) {
    console.error('[updatePassword]', error);
    return res.status(500).json({ error: 'Erreur serveur lors de la modification du mot de passe' });
  }
});

usersRouter.post('/me/photo', upload.single('photo'), async (req: AuthRequest, res: Response) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'Aucun fichier' });
    const photoUrl = `/uploads/${req.file.filename}`;
    await prisma.utilisateur.update({ where: { id: req.user!.id }, data: { photo: photoUrl } });
    return res.json({ photo: photoUrl });
  } catch (error) {
    console.error('[uploadPhoto]', error);
    return res.status(500).json({ error: "Erreur serveur lors de l upload de la photo" });
  }
});

usersRouter.get('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const user = await prisma.utilisateur.findUnique({
      where: { id: req.params.id },
      select: { id: true, nom: true, prenom: true, photo: true, ville: true, universite: true, niveau: true, filiere: true, createdAt: true },
    });
    if (!user) return res.status(404).json({ error: 'Utilisateur introuvable' });
    return res.json(user);
  } catch (error) {
    console.error('[getUser]', error);
    return res.status(500).json({ error: "Erreur serveur lors de la recuperation de l utilisateur" });
  }
});
