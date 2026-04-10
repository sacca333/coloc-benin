// ── colocations.router.ts ─────────────────────────────────────────────────────
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
    body('nom').trim().notEmpty(),
    body('ville').trim().notEmpty(),
    body('loyerTotal').isInt({ min: 1 }),
    body('nbPlaces').isInt({ min: 2 }),
  ],
  validate,
  creerColocation
);

colocationsRouter.post(
  '/:id/inviter',
  requireAbonnementActif,
  [body('email').isEmail()],
  validate,
  inviterColocataire
);

colocationsRouter.post('/:id/accepter/:token', accepterInvitation);
colocationsRouter.patch('/:id/loyer-paye', marquerLoyerPaye);
colocationsRouter.patch('/:id/colocataires/:userId/statut', mettreAJourStatutColocataire);
