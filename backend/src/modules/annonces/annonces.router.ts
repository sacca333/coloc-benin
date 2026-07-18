import { Router, Request, Response, NextFunction } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import sharp from 'sharp';
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

const UPLOAD_DIR = process.env.UPLOAD_DIR || './uploads';

// Stockage temporaire avant compression
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, UPLOAD_DIR);
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `tmp-${Date.now()}-${Math.random().toString(36).slice(2)}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: (Number(process.env.MAX_FILE_SIZE_MB) || 10) * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const allowed = ['.jpg', '.jpeg', '.png', '.webp'];
    if (allowed.includes(path.extname(file.originalname).toLowerCase())) {
      cb(null, true);
    } else {
      cb(new Error('Format non supporte') as any, false);
    }
  },
});

// Middleware de compression Sharp
const compressImages = async (req: Request, _res: Response, next: NextFunction) => {
  if (!req.files || !(req.files as Express.Multer.File[]).length) return next();
  try {
    const compressed: Express.Multer.File[] = [];
    for (const file of req.files as Express.Multer.File[]) {
      const newFilename = `annonce-${Date.now()}-${Math.random().toString(36).slice(2)}.webp`;
      const newPath = path.join(UPLOAD_DIR, newFilename);
      await sharp(file.path)
        .resize(1200, 900, { fit: 'inside', withoutEnlargement: true })
        .webp({ quality: 82 })
        .toFile(newPath);
      fs.unlinkSync(file.path); // Supprimer le fichier temporaire
      compressed.push({ ...file, filename: newFilename, path: newPath });
    }
    req.files = compressed;
    next();
  } catch (err) {
    console.error('[compressImages]', err);
    next(err);
  }
};

export const annoncesRouter = Router();

annoncesRouter.get('/', listerAnnonces);
annoncesRouter.get('/:id', getAnnonce);

annoncesRouter.post(
  '/',
  authenticate,
  requireAbonnementActif,
  upload.array('photos', 5),
  compressImages,
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