import { Response } from 'express';
import { prisma } from '../../config/database';
import { AuthRequest } from '../../middlewares/auth.middleware';
import { sendEmail } from '../../utils/mailer';
import jwt from 'jsonwebtoken';

// ─────────────────────────────────────────────
// Créer une colocation
// ─────────────────────────────────────────────
export const creerColocation = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user!.id;

        // Vérifier que l'utilisateur n'est pas déjà dans une colocation active
        const dejaActif = await prisma.colocataire.findFirst({
            where: { utilisateurId: userId, statut: 'ACTIF' },
        });
        if (dejaActif) {
            return res.status(409).json({ error: "Vous êtes déjà membre actif d'une colocation" });
        }

        const { nom, adresse, ville, loyerTotal, nbPlaces, description } = req.body;

        // À la création, le fondateur est seul donc sa part = loyer total
        const colocation = await prisma.colocation.create({
            data: {
                nom,
                adresse,
                ville,
                loyerTotal,
                nbPlaces,
                description,
                statut: 'EN_ATTENTE',
                colocataires: {
                    create: {
                        utilisateurId: userId,
                        partLoyer: loyerTotal, // seul pour l'instant, recalculé à chaque arrivée
                        statut: 'ACTIF',
                    },
                },
            },
            include: {
                colocataires: {
                    include: {
                        utilisateur: { select: { nom: true, prenom: true, email: true } },
                    },
                },
            },
        });

        return res.status(201).json(colocation);
    } catch (error) {
        console.error('[creerColocation]', error);
        return res.status(500).json({ error: 'Erreur serveur lors de la création de la colocation' });
    }
};

// ─────────────────────────────────────────────
// Mes colocations
// ─────────────────────────────────────────────
export const mesColocations = async (req: AuthRequest, res: Response) => {
    try {
        const colocataires = await prisma.colocataire.findMany({
            where: { utilisateurId: req.user!.id },
            include: {
                colocation: {
                    include: {
                        colocataires: {
                            include: {
                                utilisateur: { select: { nom: true, prenom: true, photo: true } },
                            },
                        },
                    },
                },
            },
        });

        const result = colocataires.map(c => ({
            ...c.colocation,
            monStatut: c.statut,
            maPartLoyer: c.partLoyer,
        }));

        return res.json(result);
    } catch (error) {
        console.error('[mesColocations]', error);
        return res.status(500).json({ error: 'Erreur serveur lors de la récupération des colocations' });
    }
};

// ─────────────────────────────────────────────
// Détail d'une colocation
// ─────────────────────────────────────────────
export const getColocation = async (req: AuthRequest, res: Response) => {
    try {
        const colocation = await prisma.colocation.findUnique({
            where: { id: req.params.id },
            include: {
                annonce: true,
                colocataires: {
                    include: {
                        utilisateur: {
                            select: { id: true, nom: true, prenom: true, photo: true, universite: true },
                        },
                    },
                },
            },
        });

        if (!colocation) {
            return res.status(404).json({ error: 'Colocation introuvable' });
        }

        return res.json(colocation);
    } catch (error) {
        console.error('[getColocation]', error);
        return res.status(500).json({ error: 'Erreur serveur lors de la récupération de la colocation' });
    }
};

// ─────────────────────────────────────────────
// Inviter un colocataire
// ─────────────────────────────────────────────
export const inviterColocataire = async (req: AuthRequest, res: Response) => {
    try {
        const { email } = req.body;
        const colocId = req.params.id;

        const colocation = await prisma.colocation.findUnique({
            where: { id: colocId },
            include: { colocataires: true },
        });
        if (!colocation) {
            return res.status(404).json({ error: 'Colocation introuvable' });
        }

        // Vérifier que la colocation n'est pas complète
        const actifs = colocation.colocataires.filter(c => c.statut === 'ACTIF').length;
        if (actifs >= colocation.nbPlaces) {
            return res.status(400).json({ error: 'La colocation est complète' });
        }

        const invite = await prisma.utilisateur.findUnique({ where: { email } });
        if (!invite) {
            return res.status(404).json({ error: 'Aucun compte trouvé pour cet email' });
        }

        // FIX : vérifier que l'invité n'est pas déjà membre actif de cette colocation
        const dejaMembreColoc = colocation.colocataires.find(
            c => c.utilisateurId === invite.id && c.statut === 'ACTIF'
        );
        if (dejaMembreColoc) {
            return res.status(409).json({ error: 'Cet utilisateur est déjà membre de cette colocation' });
        }

        // FIX : utiliser un JWT signé au lieu d'un simple base64
        const token = jwt.sign(
            { colocId, userId: invite.id },
            process.env.JWT_SECRET!,
            { expiresIn: '7d' }
        );

        const lien = `${process.env.FRONTEND_URL}/colocations/${colocId}/accepter/${token}`;

        await sendEmail(
            email,
            'Invitation à rejoindre une colocation',
            `
            <p>Bonjour ${invite.prenom},</p>
            <p>Vous êtes invité(e) à rejoindre la colocation <strong>${colocation.nom}</strong>.</p>
            <p><a href="${lien}">Accepter l'invitation</a></p>
            <p>Ce lien expire dans 7 jours.</p>
            `
        );

        return res.json({ message: `Invitation envoyée à ${email}` });
    } catch (error) {
        console.error('[inviterColocataire]', error);
        return res.status(500).json({ error: "Erreur serveur lors de l'envoi de l'invitation" });
    }
};

// ─────────────────────────────────────────────
// Accepter une invitation
// ─────────────────────────────────────────────
export const accepterInvitation = async (req: AuthRequest, res: Response) => {
    try {
        const { token } = req.params;

        // FIX : vérifier et décoder le JWT signé
        let payload: { colocId: string; userId: string };
        try {
            payload = jwt.verify(token, process.env.JWT_SECRET!) as { colocId: string; userId: string };
        } catch {
            return res.status(400).json({ error: "Token d'invitation invalide ou expiré" });
        }

        const { colocId, userId } = payload;

        // Vérifier que le token est bien destiné à l'utilisateur connecté
        if (userId !== req.user!.id) {
            return res.status(403).json({ error: 'Invitation non destinée à ce compte' });
        }

        // Vérifier que l'utilisateur n'est pas déjà dans une colocation active
        const dejaActif = await prisma.colocataire.findFirst({
            where: { utilisateurId: userId, statut: 'ACTIF' },
        });
        if (dejaActif) {
            return res.status(409).json({ error: 'Vous êtes déjà dans une colocation active' });
        }

        const colocation = await prisma.colocation.findUnique({
            where: { id: colocId },
            include: { colocataires: { where: { statut: 'ACTIF' } } },
        });
        if (!colocation) {
            return res.status(404).json({ error: 'Colocation introuvable' });
        }

        // FIX : on supprime le double calcul — on calcule une seule fois après l'upsert
        await prisma.colocataire.upsert({
            where: { utilisateurId_colocId: { utilisateurId: userId, colocId } },
            create: { utilisateurId: userId, colocId, partLoyer: 0, statut: 'ACTIF' },
            update: { statut: 'ACTIF' },
        });

        // Recalcul unique de la part pour tous les actifs (incluant le nouveau)
        const actifs = await prisma.colocataire.findMany({
            where: { colocId, statut: 'ACTIF' },
        });
        const nouvellePart = Math.floor(colocation.loyerTotal / actifs.length);

        await prisma.colocataire.updateMany({
            where: { colocId, statut: 'ACTIF' },
            data: { partLoyer: nouvellePart },
        });

        // Passer la colocation en ACTIVE dès qu'il y a au moins 2 membres
        if (actifs.length >= 2) {
            await prisma.colocation.update({
                where: { id: colocId },
                data: { statut: 'ACTIVE' },
            });
        }

        return res.json({ message: 'Vous avez rejoint la colocation avec succès' });
    } catch (error) {
        console.error('[accepterInvitation]', error);
        return res.status(500).json({ error: "Erreur serveur lors de l'acceptation de l'invitation" });
    }
};

// ─────────────────────────────────────────────
// Marquer le loyer comme payé
// ─────────────────────────────────────────────
export const marquerLoyerPaye = async (req: AuthRequest, res: Response) => {
    try {
        // FIX : faute de frappe corrigée "loierConfirme" → "loyerConfirme"
        const updated = await prisma.colocataire.updateMany({
            where: {
                colocId: req.params.id,
                utilisateurId: req.user!.id,
                statut: 'ACTIF',
            },
            data: { loyerConfirme: true },
        });

        if (updated.count === 0) {
            return res.status(404).json({ error: 'Non membre de cette colocation' });
        }

        return res.json({ message: 'Paiement de loyer confirmé (suivi interne)' });
    } catch (error) {
        console.error('[marquerLoyerPaye]', error);
        return res.status(500).json({ error: 'Erreur serveur lors de la confirmation du loyer' });
    }
};

// ─────────────────────────────────────────────
// Mettre à jour le statut d'un colocataire
// ─────────────────────────────────────────────
export const mettreAJourStatutColocataire = async (req: AuthRequest, res: Response) => {
    try {
        const { statut } = req.body;
        const colocId = req.params.id;
        const cibleUserId = req.params.userId;
        const demandeurId = req.user!.id;

        if (!['ACTIF', 'PARTI'].includes(statut)) {
            return res.status(400).json({ error: 'Statut invalide' });
        }

        // FIX : vérifier que le demandeur est bien membre actif de cette colocation
        // (seul un colocataire actif peut modifier le statut d'un autre)
        const demandeur = await prisma.colocataire.findFirst({
            where: { colocId, utilisateurId: demandeurId, statut: 'ACTIF' },
        });
        if (!demandeur) {
            return res.status(403).json({ error: "Vous n'êtes pas autorisé à modifier cette colocation" });
        }

        await prisma.colocataire.updateMany({
            where: { colocId, utilisateurId: cibleUserId },
            // FIX : faute de frappe corrigée "loierConfirme" → "loyerConfirme"
            data: { statut, loyerConfirme: false },
        });

        if (statut === 'PARTI') {
            // FIX : on charge la colocation seulement si nécessaire (dans le bloc PARTI)
            const colocation = await prisma.colocation.findUnique({ where: { id: colocId } });
            if (!colocation) {
                return res.status(404).json({ error: 'Colocation introuvable' });
            }

            const actifs = await prisma.colocataire.findMany({
                where: { colocId, statut: 'ACTIF' },
            });

            if (actifs.length < 2) {
                await prisma.colocation.update({
                    where: { id: colocId },
                    data: { statut: 'EN_ATTENTE' },
                });
            } else {
                const nouvellePart = Math.floor(colocation.loyerTotal / actifs.length);
                await prisma.colocataire.updateMany({
                    where: { colocId, statut: 'ACTIF' },
                    data: { partLoyer: nouvellePart },
                });
            }
        }

        return res.json({ message: 'Statut mis à jour' });
    } catch (error) {
        console.error('[mettreAJourStatutColocataire]', error);
        return res.status(500).json({ error: 'Erreur serveur lors de la mise à jour du statut' });
    }
}; // FIX : accolade fermante manquante ajoutée