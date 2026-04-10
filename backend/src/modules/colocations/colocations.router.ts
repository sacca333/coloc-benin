import { Router } from 'express';
import { body } from 'express-validator';
import { authenticate, requireAbonnementActif } from '../../middlewares/auth.middleware';
import { validate } from '../../middlewares/validate.middleware';
import {
  creerColocation,
  getColocation,
  mesColocations,
  inviterColocataire,
  accepterInvitation,
  marquerLoyerPaye,
  mettreAJourStatutColocataire,
} from './colocations.controller';

export const colocationsRouter = Router();

colocationsRouter.use(authenticate);

colocationsRouter.get('/', mesColocations);
colocationsRouter.get('/:id', getColocation);

colocationsRouter.post(
  '/',
  requireAbonnementActif,
  [
    body('nom').trim().notEmpty().withMessage('Nom requis'),
    body('ville').trim().notEmpty().withMessage('Ville requise'),
    body('loyerTotal').isInt({ min: 1 }).withMessage('Loyer invalide'),
    body('nbPlaces').isInt({ min: 2, max: 10 }).withMessage('Min 2 places'),
  ],
  validate,
  creerColocation
);

colocationsRouter.post(
  '/:id/inviter',
  requireAbonnementActif,
  [body('email').isEmail().withMessage('Email invalide')],
  validate,
  inviterColocataire
);

colocationsRouter.post('/:id/accepter/:token', accepterInvitation);
colocationsRouter.patch('/:id/loyer-paye', marquerLoyerPaye);
colocationsRouter.patch(
  '/:id/colocataires/:userId/statut',
  [body('statut').isIn(['ACTIF', 'PARTI'])],
  validate,
  mettreAJourStatutColocataire
);
