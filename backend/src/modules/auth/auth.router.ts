import { Router } from 'express';
import { body } from 'express-validator';
import { register, login, verifyEmail, getMe, forgotPassword, resetPassword } from './auth.controller';
import { authenticate } from '../../middlewares/auth.middleware';
import { validate } from '../../middlewares/validate.middleware';

export const authRouter = Router();

authRouter.post(
  '/register',
  [
    body('nom').trim().notEmpty().withMessage('Nom requis'),
    body('prenom').trim().notEmpty().withMessage('Prenom requis'),
    body('email').isEmail().withMessage('Email invalide'),
    body('motDePasse').isLength({ min: 8 }).withMessage('Mot de passe min 8 caracteres'),
    body('sexe').isIn(['HOMME', 'FEMME']).withMessage('Sexe requis'),
  ],
  validate,
  register
);

authRouter.post(
  '/login',
  [
    body('email').isEmail(),
    body('motDePasse').notEmpty(),
  ],
  validate,
  login
);

authRouter.get('/verify-email/:token', verifyEmail);
authRouter.get('/me', authenticate, getMe);
authRouter.post('/forgot-password', [body('email').isEmail().withMessage('Email invalide')], validate, forgotPassword);
authRouter.post('/reset-password/:token', [body('nouveauMotDePasse').isLength({ min: 8 })], validate, resetPassword);
