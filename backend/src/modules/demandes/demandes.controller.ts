import { Response } from 'express';
import { prisma } from '../../config/database';
import { AuthRequest } from '../../middlewares/auth.middleware';

export const envoyerDemande = async (req: AuthRequest, res: Response) => {
  try {
    const { annonceId, message } = req.body;
    const requesterId = req.user!.id;
    const annonce = await prisma.annonce.findUnique({ where: { id: annonceId } });
    if (!annonce) return res.status(404).json({ error: 'Annonce introuvable' });
    if (annonce.statut !== 'ACTIVE') return res.status(400).json({ error: 'Cette annonce n est plus disponible' });
    if (annonce.placesRestantes <= 0) return res.status(400).json({ error: 'Plus de places disponibles' });
    if (annonce.proprietaireId === requesterId) return res.status(400).json({ error: 'Vous ne pouvez pas postuler a votre propre annonce' });
    const dejaExiste = await prisma.demande.findUnique({
      where: { annonceId_requesterId: { annonceId, requesterId } },
    });
    if (dejaExiste && !['CANCELLED', 'REJECTED'].includes(dejaExiste.statut)) {
      return res.status(409).json({ error: 'Vous avez deja une demande en cours pour cette annonce' });
    }
    const demande = await prisma.demande.upsert({
      where: { annonceId_requesterId: { annonceId, requesterId } },
      create: { annonceId, requesterId, message, statut: 'PENDING' },
      update: { message, statut: 'PENDING', requesterConfirme: false, auteurConfirme: false },
      include: {
        requester: { select: { id: true, nom: true, prenom: true, photo: true, universite: true } },
        annonce: { select: { id: true, ville: true, loyerTotal: true } },
      },
    });
    return res.status(201).json(demande);
  } catch (error) {
    console.error('[envoyerDemande]', error);
    return res.status(500).json({ error: 'Erreur serveur lors de l envoi de la demande' });
  }
};

export const accepterDemande = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user!.id;
    const demande = await prisma.demande.findUnique({ where: { id }, include: { annonce: true } });
    if (!demande) return res.status(404).json({ error: 'Demande introuvable' });
    if (demande.annonce.proprietaireId !== userId) return res.status(403).json({ error: 'Seul l auteur de l annonce peut accepter une demande' });
    if (demande.statut !== 'PENDING') return res.status(400).json({ error: 'Impossible d accepter cette demande' });
    if (demande.annonce.placesRestantes <= 0) return res.status(400).json({ error: 'Plus de places disponibles' });
    const updated = await prisma.demande.update({
      where: { id },
      data: { statut: 'AGREEMENT_PENDING' },
      include: { requester: { select: { id: true, nom: true, prenom: true, photo: true } } },
    });
    return res.json({ message: 'Demande acceptee. En attente de double confirmation.', demande: updated });
  } catch (error) {
    console.error('[accepterDemande]', error);
    return res.status(500).json({ error: 'Erreur serveur lors de l acceptation' });
  }
};

export const refuserDemande = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user!.id;
    const demande = await prisma.demande.findUnique({ where: { id }, include: { annonce: true } });
    if (!demande) return res.status(404).json({ error: 'Demande introuvable' });
    if (demande.annonce.proprietaireId !== userId) return res.status(403).json({ error: 'Seul l auteur de l annonce peut refuser une demande' });
    if (!['PENDING', 'AGREEMENT_PENDING'].includes(demande.statut)) return res.status(400).json({ error: 'Cette demande ne peut plus etre refusee' });
    const updated = await prisma.demande.update({ where: { id }, data: { statut: 'REJECTED' } });
    return res.json({ message: 'Demande refusee', demande: updated });
  } catch (error) {
    console.error('[refuserDemande]', error);
    return res.status(500).json({ error: 'Erreur serveur lors du refus' });
  }
};

export const confirmerDemande = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user!.id;
    const demande = await prisma.demande.findUnique({ where: { id }, include: { annonce: true } });
    if (!demande) return res.status(404).json({ error: 'Demande introuvable' });
    if (demande.statut !== 'AGREEMENT_PENDING') return res.status(400).json({ error: 'Cette demande n est pas en attente de confirmation' });
    const isAuteur = demande.annonce.proprietaireId === userId;
    const isRequester = demande.requesterId === userId;
    if (!isAuteur && !isRequester) return res.status(403).json({ error: 'Vous n etes pas autorise a confirmer cette demande' });
    if (isRequester && demande.requesterConfirme) return res.status(400).json({ error: 'Vous avez deja confirme cette demande' });
    if (isAuteur && demande.auteurConfirme) return res.status(400).json({ error: 'Vous avez deja confirme cette demande' });
    const updateData: any = {};
    if (isRequester) updateData.requesterConfirme = true;
    if (isAuteur) updateData.auteurConfirme = true;
    const requesterConfirme = isRequester ? true : demande.requesterConfirme;
    const auteurConfirme = isAuteur ? true : demande.auteurConfirme;
    if (requesterConfirme && auteurConfirme) {
      updateData.statut = 'CONFIRMED';
      await prisma.$transaction(async (tx) => {
        await tx.demande.update({ where: { id }, data: updateData });
        const annonce = await tx.annonce.update({
          where: { id: demande.annonceId },
          data: { placesRestantes: { decrement: 1 } },
        });
        if (annonce.placesRestantes <= 0) {
          await tx.annonce.update({ where: { id: demande.annonceId }, data: { statut: 'COMPLET' } });
        }
        await tx.demande.updateMany({
          where: { annonceId: demande.annonceId, id: { not: id }, statut: { in: ['PENDING', 'AGREEMENT_PENDING'] } },
          data: { statut: 'REJECTED' },
        });
      });
      return res.json({ message: 'Accord confirme ! Place attribuee.', statut: 'CONFIRMED' });
    } else {
      await prisma.demande.update({ where: { id }, data: updateData });
      return res.json({
        message: isRequester ? 'Votre confirmation enregistree. En attente de l auteur.' : 'Votre confirmation enregistree. En attente du demandeur.',
        statut: 'AGREEMENT_PENDING',
      });
    }
  } catch (error) {
    console.error('[confirmerDemande]', error);
    return res.status(500).json({ error: 'Erreur serveur lors de la confirmation' });
  }
};

export const demandesRecues = async (req: AuthRequest, res: Response) => {
  try {
    const demandes = await prisma.demande.findMany({
      where: { annonce: { proprietaireId: req.user!.id } },
      include: {
        requester: { select: { id: true, nom: true, prenom: true, photo: true, universite: true, niveau: true } },
        annonce: { select: { id: true, ville: true, quartier: true, loyerTotal: true, placesRestantes: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
    return res.json(demandes);
  } catch (error) {
    console.error('[demandesRecues]', error);
    return res.status(500).json({ error: 'Erreur serveur' });
  }
};

export const demandesEnvoyees = async (req: AuthRequest, res: Response) => {
  try {
    const demandes = await prisma.demande.findMany({
      where: { requesterId: req.user!.id },
      include: {
        annonce: {
          select: {
            id: true, ville: true, quartier: true, loyerTotal: true, placesRestantes: true, statut: true,
            proprietaire: { select: { id: true, nom: true, prenom: true, photo: true } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
    return res.json(demandes);
  } catch (error) {
    console.error('[demandesEnvoyees]', error);
    return res.status(500).json({ error: 'Erreur serveur' });
  }
};

export const annulerDemande = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const demande = await prisma.demande.findUnique({ where: { id } });
    if (!demande) return res.status(404).json({ error: 'Demande introuvable' });
    if (demande.requesterId !== req.user!.id) return res.status(403).json({ error: 'Vous ne pouvez annuler que vos propres demandes' });
    if (['CONFIRMED', 'REJECTED', 'CANCELLED'].includes(demande.statut)) return res.status(400).json({ error: 'Cette demande ne peut plus etre annulee' });
    await prisma.demande.update({ where: { id }, data: { statut: 'CANCELLED' } });
    return res.json({ message: 'Demande annulee' });
  } catch (error) {
    console.error('[annulerDemande]', error);
    return res.status(500).json({ error: 'Erreur serveur lors de l annulation' });
  }
};
