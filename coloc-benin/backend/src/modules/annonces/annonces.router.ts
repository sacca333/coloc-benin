// ── modules/annonces/annonces.router.ts ───────────────────────────────────────
import { Router } from 'express';
import { authenticate, requireAbonnementActif } from '../../middlewares/auth.middleware';
import multer from 'multer';
import path from 'path';

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, process.env.UPLOAD_DIR || './uploads'),
  filename: (_req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`),
});
const upload = multer({
  storage,
  limits: { fileSize: (Number(process.env.MAX_FILE_SIZE_MB) || 5) * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const allowed = ['.jpg', '.jpeg', '.png', '.webp'];
    cb(null, allowed.includes(path.extname(file.originalname).toLowerCase()));
  },
});

export const annoncesRouter = Router();
// GET  /api/annonces           — liste avec filtres (ville, budget, type, equipements)
// GET  /api/annonces/:id       — détail
// POST /api/annonces           — créer (abonnement requis)
// PUT  /api/annonces/:id       — modifier (propriétaire)
// DEL  /api/annonces/:id       — supprimer (propriétaire ou admin)
// POST /api/annonces/:id/photos — upload photos (multer)

// À implémenter : les controllers appelant prisma avec les filtres de recherche

// ── modules/users/users.router.ts ─────────────────────────────────────────────
import { Router as UsersRouter } from 'express';
export const usersRouter = UsersRouter();
// GET  /api/users/:id          — profil public
// PUT  /api/users/me           — modifier profil
// POST /api/users/me/photo     — upload photo de profil
// GET  /api/users/recherche    — recherche colocataires (filtres)

// ── modules/messagerie/messagerie.router.ts ───────────────────────────────────
import { Router as MsgRouter } from 'express';
export const messagerieRouter = MsgRouter();
// GET  /api/messagerie/conversations  — liste des conversations
// GET  /api/messagerie/:userId        — messages avec un utilisateur
// POST /api/messagerie/:userId        — envoyer un message (abonnement requis)
// PATCH /api/messagerie/lu/:messageId — marquer comme lu

// ── modules/admin/admin.router.ts ─────────────────────────────────────────────
import { Router as AdminRouter } from 'express';
import { authenticate as adminAuth, requireAdmin } from '../../middlewares/auth.middleware';
export const adminRouter = AdminRouter();
adminRouter.use(adminAuth, requireAdmin);
// GET  /api/admin/stats        — dashboard global (utilisateurs, abonnements, annonces)
// GET  /api/admin/utilisateurs — liste avec filtres
// PATCH /api/admin/utilisateurs/:id/statut — activer/suspendre
// GET  /api/admin/annonces     — modération
// PATCH /api/admin/annonces/:id/statut
// GET  /api/admin/abonnements  — tableau paiements
// GET  /api/admin/abonnements/export — CSV
