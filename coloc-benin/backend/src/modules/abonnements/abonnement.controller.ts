import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { prisma } from '../../config/database';
import { getPaymentProvider } from '../../services/payment/payment.service';
import { AuthRequest } from '../../middlewares/auth.middleware';
import { sendPaymentConfirmationEmail } from '../../utils/mailer';

export const initierAbonnement = async (req: AuthRequest, res: Response) => {
    try {
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

        return res.json({
            message: resultat.message,
            abonnementId: abonnement.id,
            reference,
            statut: resultat.statut,
        });
    } catch (error) {
        console.error('[initierAbonnement]', error);
        return res.status(500).json({ error: "Erreur serveur lors de l'initiation du paiement" });
    }
};

export const getStatut = async (req: AuthRequest, res: Response) => {
    try {
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

        return res.json({ actif: !!abonnement, abonnement });
    } catch (error) {
        console.error('[getStatut]', error);
        return res.status(500).json({ error: "Erreur serveur lors de la récupération du statut" });
    }
};

export const getHistorique = async (req: AuthRequest, res: Response) => {
    try {
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

        return res.json(historique);
    } catch (error) {
        console.error('[getHistorique]', error);
        return res.status(500).json({ error: "Erreur serveur lors de la récupération de l'historique" });
    }
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