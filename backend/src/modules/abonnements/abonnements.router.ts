import { Router } from 'express';
import { body } from 'express-validator';
import { authenticate } from '../../middlewares/auth.middleware';
import { validate } from '../../middlewares/validate.middleware';
import {
  initierAbonnement,
  getStatut,
  getHistorique,
  webhookMoMo,
  webhookCCash,
  webhookMoov,
  confirmerKkiapay,
} from './abonnements.controller';

export const abonnementsRouter = Router();

// Routes protégées
abonnementsRouter.post(
  '/initier',
  authenticate,
  [
    body('operateur').isIn(['MOMO', 'CCASH', 'MOOV_MONEY']).withMessage('Opérateur invalide'),
    body('telephone').trim().notEmpty().withMessage('Numéro de téléphone requis'),
  ],
  validate,
  initierAbonnement
);

abonnementsRouter.get('/statut', authenticate, getStatut);
abonnementsRouter.get('/historique', authenticate, getHistorique);
abonnementsRouter.post('/confirmer-kkiapay', authenticate, confirmerKkiapay);

// Webhooks — pas d'auth JWT, sécurisé par signature opérateur
export const webhooksRouter = Router();
webhooksRouter.post('/momo', webhookMoMo);
webhooksRouter.post('/ccash', webhookCCash);
webhooksRouter.post('/moov', webhookMoov);
