import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { prisma } from '../config/database';

export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    typeCompte: string;
  };
}

export const authenticate = async (req: AuthRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Token manquant' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET!) as {
      id: string; email: string; typeCompte: string;
    };

    const user = await prisma.utilisateur.findUnique({
      where: { id: payload.id },
      select: { id: true, email: true, typeCompte: true, actif: true },
    });

    if (!user || !user.actif) {
      return res.status(401).json({ error: 'Compte inactif ou introuvable' });
    }

    req.user = { id: user.id, email: user.email, typeCompte: user.typeCompte };
    next();
  } catch {
    return res.status(401).json({ error: 'Token invalide ou expiré' });
  }
};

// FIX : ajout du try/catch sur requireAbonnementActif
export const requireAbonnementActif = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const abonnement = await prisma.abonnement.findFirst({
      where: {
        utilisateurId: req.user!.id,
        statut: 'ACTIF',
        periodeFin: { gte: new Date() },
      },
    });

    if (!abonnement) {
      return res.status(402).json({
        error: 'Abonnement requis',
        message: 'Votre abonnement est expiré ou inactif. Veuillez renouveler pour accéder à cette fonctionnalité.',
      });
    }

    next();
  } catch (error) {
    console.error('[requireAbonnementActif]', error);
    return res.status(500).json({ error: 'Erreur serveur lors de la vérification de l\'abonnement' });
  }
};

export const requireAdmin = (req: AuthRequest, res: Response, next: NextFunction) => {
  if (req.user?.typeCompte !== 'ADMIN') {
    return res.status(403).json({ error: 'Accès réservé aux administrateurs' });
  }
  return next();
};