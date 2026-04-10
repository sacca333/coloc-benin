import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import { body } from 'express-validator';
import { authenticate, requireAbonnementActif } from '../../middlewares/auth.middleware';
import { validate } from '../../middlewares/validate.middleware';
import {
  listerAnnonces,
  getAnnonce,
  creerAnnonce,
  modifierAnnonce,
  supprimerAnnonce,
} from './annonces.controller';

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, process.env.UPLOAD_DIR || './uploads');
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `annonce-${Date.now()}-${Math.random().toString(36).slice(2)}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: (Number(process.env.MAX_FILE_SIZE_MB) || 5) * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const allowed = ['.jpg', '.jpeg', '.png', '.webp'];
    if (allowed.includes(path.extname(file.originalname).toLowerCase())) {
      cb(null, true);
    } else {
      cb(new Error('Format non supporté') as any, false);
    }
  },
});

export const annoncesRouter = Router();

annoncesRouter.get('/', listerAnnonces);
annoncesRouter.get('/:id', getAnnonce);

annoncesRouter.post(
  '/',
  authenticate,
  requireAbonnementActif,
  upload.array('photos', 5),
  [
    body('type').isIn(['LOGEMENT_DISPONIBLE', 'PLACE_EN_COLOCATION']),
    body('ville').trim().notEmpty().withMessage('Ville requise'),
    body('loyerTotal').isNumeric().withMessage('Loyer invalide'),
    body('nbPlaces').isInt({ min: 2, max: 10 }),
  ],
  validate,
  creerAnnonce
);

annoncesRouter.put('/:id', authenticate, modifierAnnonce);
annoncesRouter.delete('/:id', authenticate, supprimerAnnonce);
