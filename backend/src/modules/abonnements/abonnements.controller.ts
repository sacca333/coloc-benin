import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { prisma } from '../../config/database';
import { getPaymentProvider } from '../../services/payment/payment.service';
import { AuthRequest } from '../../middlewares/auth.middleware';
import { sendPaymentConfirmationEmail } from '../../utils/mailer';

export const initierAbonnement = async (req: AuthRequest, res: Response) => {
  const { operateur, telephone } = req.body;
  const userId = req.user!.id;
  const reference = uuidv4();

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
    description: 'Abonnement mensuel ColocBénin — 300 FCFA',
  });

  if (resultat.statut === 'ECHEC') {
    await prisma.abonnement.update({
      where: { id: abonnement.id },
      data: { statut: 'ECHEC' },
    });
    return res.status(400).json({ error: resultat.message });
  }

  res.json({
    message: resultat.message,
    abonnementId: abonnement.id,
    reference,
    statut: resultat.statut,
  });
};

export const getStatut = async (req: AuthRequest, res: Response) => {
  const abonnement = await prisma.abonnement.findFirst({
    where: {
      utilisateurId: req.user!.id,
      statut: 'ACTIF',
      periodeFin: { gte: new Date() },
    },
    select: {
      statut: true,
      operateur: true,
      periodeDebut: true,
      periodeFin: true,
      montant: true,
    },
    orderBy: { createdAt: 'desc' },
  });

  res.json({ actif: !!abonnement, abonnement });
};

export const getHistorique = async (req: AuthRequest, res: Response) => {
  const historique = await prisma.abonnement.findMany({
    where: { utilisateurId: req.user!.id },
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      operateur: true,
      montant: true,
      statut: true,
      datePaiement: true,
      periodeDebut: true,
      periodeFin: true,
    },
  });
  res.json(historique);
};

// ── Helpers webhooks ──────────────────────────────────────────────────────────

async function confirmerAbonnement(referenceOperateur: string, referenceInterne: string) {
  const now = new Date();
  const fin = new Date(now);
  fin.setMonth(fin.getMonth() + 1);

  const result = await prisma.abonnement.updateMany({
    where: { referenceOp: referenceInterne, statut: 'EN_ATTENTE' },
    data: {
      statut: 'ACTIF',
      referenceOp: referenceOperateur,
      datePaiement: now,
      periodeDebut: now,
      periodeFin: fin,
    },
  });

  if (result.count > 0) {
    // Envoyer email de confirmation
    const abonnement = await prisma.abonnement.findFirst({
      where: { referenceOp: referenceOperateur },
      include: { utilisateur: { select: { email: true, nom: true, prenom: true } } },
    });
    if (abonnement?.utilisateur) {
      await sendPaymentConfirmationEmail(
        abonnement.utilisateur.email,
        abonnement.utilisateur.prenom,
        abonnement.operateur,
        fin
      ).catch(() => { }); // Ne pas bloquer si l'email échoue
    }
  }

  return result;
}

export const confirmerFedapay = async (req: AuthRequest, res: Response) => {
  const { transactionId } = req.body;
  const userId = req.user!.id;

  if (!transactionId) return res.status(400).json({ error: 'transactionId requis' });

  try {
    // Anti-rejeu : cette transaction n'a pas deja servi a activer un abonnement
    const existing = await prisma.abonnement.findFirst({
      where: { referenceOp: String(transactionId), statut: 'ACTIF' },
    });
    if (existing) return res.status(409).json({ error: 'Transaction deja utilisee' });

    // Verification serveur-a-serveur aupres de FedaPay (ne jamais faire confiance au client seul)
    const environment = process.env.FEDAPAY_ENVIRONMENT || 'sandbox';
    const baseUrl = environment === 'live' ? 'https://api.fedapay.com' : 'https://sandbox-api.fedapay.com';

    const verifResponse = await fetch(`${baseUrl}/v1/transactions/${transactionId}`, {
      headers: { 'Authorization': `Bearer ${process.env.FEDAPAY_SECRET_KEY}` },
    });

    if (!verifResponse.ok) {
      return res.status(400).json({ error: 'Transaction FedaPay introuvable' });
    }

    const verifData = (await verifResponse.json()) as { 'v1/transaction'?: { status?: string; amount?: number } };
    const transaction = verifData['v1/transaction'];

    if (!transaction) {
      return res.status(400).json({ error: 'Reponse FedaPay invalide' });
    }
    if (transaction.status !== 'approved') {
      return res.status(400).json({ error: `Transaction non approuvee (statut : ${transaction.status})` });
    }
    if (transaction.amount !== 300) {
      console.warn('[FedaPay] Montant inattendu pour', transactionId, ':', transaction.amount);
      return res.status(400).json({ error: 'Montant de la transaction invalide' });
    }

    const now = new Date();
    const fin = new Date(now);
    fin.setMonth(fin.getMonth() + 1);

    const abonnement = await prisma.abonnement.create({
      data: {
        utilisateurId: userId,
        operateur: 'FEDAPAY',
        montant: 300,
        referenceOp: String(transactionId),
        statut: 'ACTIF',
        datePaiement: now,
        periodeDebut: now,
        periodeFin: fin,
      },
      include: { utilisateur: { select: { email: true, nom: true, prenom: true } } },
    });

    if (abonnement.utilisateur) {
      sendPaymentConfirmationEmail(
        abonnement.utilisateur.email,
        abonnement.utilisateur.prenom,
        'FEDAPAY',
        fin
      ).catch(() => { });
    }

    console.log('[FedaPay] Abonnement active pour', userId, '- transaction', transactionId);

    return res.json({
      message: 'Abonnement active avec succes',
      abonnement: {
        id: abonnement.id,
        statut: abonnement.statut,
        periodeDebut: abonnement.periodeDebut,
        periodeFin: abonnement.periodeFin,
      },
    });
  } catch (err) {
    console.error('[confirmerFedapay]', err);
    return res.status(500).json({ error: 'Erreur serveur' });
  }
};
export const webhookMoMo = async (req: Request, res: Response) => {
  try {
    const provider = getPaymentProvider('MOMO');
    const signature = req.headers['x-callback-token'] as string || '';

    if (!provider.validerWebhook(req.body, signature)) {
      return res.status(401).json({ error: 'Signature invalide' });
    }

    const { externalId, financialTransactionId, status } = req.body;

    if (status === 'SUCCESSFUL') {
      await confirmerAbonnement(financialTransactionId, externalId);
    } else if (status === 'FAILED') {
      await prisma.abonnement.updateMany({
        where: { referenceOp: externalId, statut: 'EN_ATTENTE' },
        data: { statut: 'ECHEC' },
      });
    }

    res.sendStatus(200);
  } catch (err) {
    console.error('Webhook MoMo error:', err);
    res.sendStatus(200); // Toujours 200 pour éviter les retry infinies
  }
};

export const webhookCCash = async (req: Request, res: Response) => {
  try {
    const provider = getPaymentProvider('CCASH');
    const signature = req.headers['x-ccash-signature'] as string || '';

    if (!provider.validerWebhook(req.body, signature)) {
      return res.status(401).json({ error: 'Signature invalide' });
    }

    const { reference, transaction_id, status } = req.body;

    if (status === 'SUCCESS') {
      await confirmerAbonnement(transaction_id, reference);
    } else if (status === 'FAILED' || status === 'CANCELLED') {
      await prisma.abonnement.updateMany({
        where: { referenceOp: reference, statut: 'EN_ATTENTE' },
        data: { statut: 'ECHEC' },
      });
    }

    res.sendStatus(200);
  } catch (err) {
    console.error('Webhook CCash error:', err);
    res.sendStatus(200);
  }
};

export const webhookMoov = async (req: Request, res: Response) => {
  try {
    const { reference, id, status } = req.body;

    if (status === 'SUCCESS' || status === 'SUCCESSFUL') {
      await confirmerAbonnement(id, reference);
    } else if (status === 'FAILED' || status === 'CANCELLED') {
      await prisma.abonnement.updateMany({
        where: { referenceOp: reference, statut: 'EN_ATTENTE' },
        data: { statut: 'ECHEC' },
      });
    }

    res.sendStatus(200);
  } catch (err) {
    console.error('Webhook Moov error:', err);
    res.sendStatus(200);
  }
};