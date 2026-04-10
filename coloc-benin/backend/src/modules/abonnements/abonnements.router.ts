// ── abonnements.router.ts ─────────────────────────────────────────────────────
import { Router } from 'express';
import { body } from 'express-validator';
import { authenticate } from '../../middlewares/auth.middleware';
import { validate } from '../../middlewares/validate.middleware';
import {
  initierAbonnement,
  getHistorique,
  getStatut,
  webhookMoMo,
  webhookCCash,
  webhookMoov,
} from './abonnements.controller';

export const abonnementsRouter = Router();

abonnementsRouter.post(
  '/initier',
  authenticate,
  [
    body('operateur').isIn(['MOMO', 'CCASH', 'MOOV_MONEY']).withMessage('Opérateur invalide'),
    body('telephone').notEmpty().withMessage('Numéro de téléphone requis'),
  ],
  validate,
  initierAbonnement
);

abonnementsRouter.get('/statut', authenticate, getStatut);
abonnementsRouter.get('/historique', authenticate, getHistorique);

// Webhooks (pas d'authentification JWT — sécurisé par signature opérateur)
abonnementsRouter.post('/webhooks/momo', webhookMoMo);
abonnementsRouter.post('/webhooks/ccash', webhookCCash);
abonnementsRouter.post('/webhooks/moov', webhookMoov);

// ── abonnements.controller.ts ─────────────────────────────────────────────────
import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { prisma } from '../../config/database';
import { getPaymentProvider } from '../../services/payment/payment.service';
import { AuthRequest } from '../../middlewares/auth.middleware';
import { sendEmail } from '../../utils/mailer';

export const initierAbonnement = async (req: AuthRequest, res: Response) => {
  const { operateur, telephone } = req.body;
  const userId = req.user!.id;

  const reference = uuidv4();

  // Créer l'abonnement en attente
  const abonnement = await prisma.abonnement.create({
    data: {
      utilisateurId: userId,
      operateur,
      montant: 300,
      referenceOp: reference,
      statut: 'EN_ATTENTE',
    },
  });

  const provider = getPaymentProvider(operateur);
  const resultat = await provider.initierPaiement({
    montant: 300,
    telephone,
    reference,
    description: 'Abonnement mensuel ColocBénin',
  });

  if (!resultat.success && resultat.statut === 'ECHEC') {
    await prisma.abonnement.update({ where: { id: abonnement.id }, data: { statut: 'ECHEC' } });
    return res.status(400).json({ error: resultat.message });
  }

  res.json({ message: resultat.message, abonnementId: abonnement.id, reference });
};

export const getStatut = async (req: AuthRequest, res: Response) => {
  const abonnement = await prisma.abonnement.findFirst({
    where: { utilisateurId: req.user!.id, statut: 'ACTIF', periodeFin: { gte: new Date() } },
    select: { statut: true, periodeDebut: true, periodeFin: true, operateur: true },
    orderBy: { createdAt: 'desc' },
  });
  res.json({ actif: !!abonnement, abonnement });
};

export const getHistorique = async (req: AuthRequest, res: Response) => {
  const historique = await prisma.abonnement.findMany({
    where: { utilisateurId: req.user!.id },
    orderBy: { createdAt: 'desc' },
    select: { id: true, operateur: true, montant: true, statut: true, datePaiement: true, periodeDebut: true, periodeFin: true },
  });
  res.json(historique);
};

// ── Webhook handlers ──────────────────────────────────────────────────────────

async function confirmerAbonnement(referenceOp: string, referenceInterne: string) {
  const now = new Date();
  const fin = new Date(now);
  fin.setMonth(fin.getMonth() + 1);

  const abonnement = await prisma.abonnement.updateMany({
    where: { referenceOp: referenceInterne, statut: { in: ['EN_ATTENTE'] } },
    data: {
      statut: 'ACTIF',
      referenceOp,
      datePaiement: now,
      periodeDebut: now,
      periodeFin: fin,
    },
  });
  return abonnement;
}

export const webhookMoMo = async (req: Request, res: Response) => {
  const provider = getPaymentProvider('MOMO');
  const signature = req.headers['x-signature'] as string || '';

  if (!provider.validerWebhook(req.body, signature)) {
    return res.status(401).json({ error: 'Signature invalide' });
  }

  const { externalId, financialTransactionId, status } = req.body;
  if (status === 'SUCCESSFUL') {
    await confirmerAbonnement(financialTransactionId, externalId);
  } else if (status === 'FAILED') {
    await prisma.abonnement.updateMany({ where: { referenceOp: externalId }, data: { statut: 'ECHEC' } });
  }
  res.sendStatus(200);
};

export const webhookCCash = async (req: Request, res: Response) => {
  const provider = getPaymentProvider('CCASH');
  const signature = req.headers['x-ccash-signature'] as string || '';

  if (!provider.validerWebhook(req.body, signature)) {
    return res.status(401).json({ error: 'Signature invalide' });
  }

  const { reference, transaction_id, status } = req.body;
  if (status === 'SUCCESS') {
    await confirmerAbonnement(transaction_id, reference);
  } else if (status === 'FAILED') {
    await prisma.abonnement.updateMany({ where: { referenceOp: reference }, data: { statut: 'ECHEC' } });
  }
  res.sendStatus(200);
};

export const webhookMoov = async (req: Request, res: Response) => {
  const { reference, id, status } = req.body;
  if (status === 'SUCCESS') {
    await confirmerAbonnement(id, reference);
  }
  res.sendStatus(200);
};
