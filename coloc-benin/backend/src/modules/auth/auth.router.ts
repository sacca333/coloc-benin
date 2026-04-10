// ── auth.router.ts ────────────────────────────────────────────────────────────
import { Router } from 'express';
import { body } from 'express-validator';
import { register, login, verifyEmail, getMe } from './auth.controller';
import { authenticate } from '../../middlewares/auth.middleware';
import { validate } from '../../middlewares/validate.middleware';

export const authRouter = Router();

authRouter.post(
  '/register',
  [
    body('nom').trim().notEmpty().withMessage('Nom requis'),
    body('prenom').trim().notEmpty().withMessage('Prénom requis'),
    body('email').isEmail().withMessage('Email invalide'),
    body('motDePasse').isLength({ min: 8 }).withMessage('Mot de passe min 8 caractères'),
    // ✅ Accepte tous les formats avec espaces, tirets, +, etc.
    body('telephone').optional().matches(/^[0-9+\s\-().]{7,20}$/),],
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
