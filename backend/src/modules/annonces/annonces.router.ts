import { Router, Request, Response, NextFunction } from 'express';
import multer from 'multer';
import path from 'path';
import sharp from 'sharp';
import { body } from 'express-validator';
import { authenticate, requireAbonnementActif } from '../../middlewares/auth.middleware';
import { validate } from '../../middlewares/validate.middleware';
import cloudinary from '../../config/cloudinary'; // adapte le chemin
import {
  listerAnnonces,
  getAnnonce,
  creerAnnonce,
  modifierAnnonce,
  supprimerAnnonce,
} from './annonces.controller';

// Stockage en mémoire : plus de fichier local, tout se passe en RAM
const storage = multer.memoryStorage();

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

// Compression Sharp en mémoire + upload vers Cloudinary
const compressAndUploadImages = async (req: Request, _res: Response, next: NextFunction) => {
  if (!req.files || !(req.files as Express.Multer.File[]).length) return next();
  try {
    const files = req.files as Express.Multer.File[];

    const uploaded = await Promise.all(
      files.map(async (file) => {
        // Compression en mémoire, pas de fichier temporaire
        const compressedBuffer = await sharp(file.buffer)
          .resize(1200, 900, { fit: 'inside', withoutEnlargement: true })
          .webp({ quality: 82 })
          .toBuffer();

        // Upload du buffer vers Cloudinary
        const result = await new Promise<{ secure_url: string; public_id: string }>(
          (resolve, reject) => {
            const uploadStream = cloudinary.uploader.upload_stream(
              { folder: 'annonces', format: 'webp' },
              (error, result) => {
                if (error || !result) return reject(error);
                resolve(result);
              }
            );
            uploadStream.end(compressedBuffer);
          }
        );

        return {
          ...file,
          path: result.secure_url,   // URL publique Cloudinary
          filename: result.public_id, // utile si tu veux supprimer l'image plus tard
        };
      })
    );

    req.files = uploaded;
    next();
  } catch (err) {
    console.error('[compressAndUploadImages]', err);
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
  compressAndUploadImages,
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