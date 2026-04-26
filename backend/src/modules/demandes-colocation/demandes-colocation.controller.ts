import { Response } from 'express';
import { prisma } from '../../config/database';
import { AuthRequest } from '../../middlewares/auth.middleware';

const abonnementActif = async (userId: string) => {
  const abo = await prisma.abonnement.findFirst({
    where: { utilisateurId: userId, statut: 'ACTIF', periodeFin: { gte: new Date() } },
  });
  return !!abo;
};

const creerNotification = async (userId: string, type: any, titre: string, message: string, data?: any) => {
  await prisma.notification.create({ data: { userId, type, titre, message, data } });
};

export const envoyerDemande = async (req: AuthRequest, res: Response) => {
  try {
    const { destinataireId, message } = req.body;
    const expediteurId = req.user!.id;
    if (expediteurId === destinataireId) return res.status(400).json({ error: 'Vous ne pouvez pas vous envoyer une demande' });
    if (!await abonnementActif(expediteurId)) return res.status(403).json({ error: 'Votre abonnement n est pas actif' });
    if (!await abonnementActif(destinataireId)) return res.status(403).json({ error: 'Votre interlocuteur doit avoir un abonnement actif' });
    const dejaExiste = await prisma.demandeColocation.findFirst({
      where: { expediteurId, destinataireId, statut: 'EN_ATTENTE' },
    });
    if (dejaExiste) return res.status(409).json({ error: 'Demande deja envoyee, en attente de reponse' });
    const demande = await prisma.demandeColocation.create({
      data: { expediteurId, destinataireId, message },
      include: {
        expediteur: { select: { id: true, nom: true, prenom: true, photo: true } },
        destinataire: { select: { id: true, nom: true, prenom: true, photo: true } },
      },
    });
    const expediteur = await prisma.utilisateur.findUnique({ where: { id: expediteurId } });
    await creerNotification(destinataireId, 'DEMANDE_COLOCATION', 'Nouvelle demande de colocation',
      expediteur?.prenom + ' ' + expediteur?.nom + ' vous propose une colocation',
      { demandeId: demande.id, expediteurId });
    return res.status(201).json(demande);
  } catch (error) {
    console.error('[envoyerDemande]', error);
    return res.status(500).json({ error: 'Erreur serveur' });
  }
};

export const accepterDemande = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user!.id;
    const demande = await prisma.demandeColocation.findUnique({
      where: { id },
      include: { expediteur: true, destinataire: true },
    });
    if (!demande) return res.status(404).json({ error: 'Demande introuvable' });
    if (demande.destinataireId !== userId) return res.status(403).json({ error: 'Non autorise' });
    if (demande.statut !== 'EN_ATTENTE') return res.status(400).json({ error: 'Demande non modifiable' });
    if (!await abonnementActif(demande.expediteurId)) return res.status(403).json({ error: 'L expediteur n a plus d abonnement actif' });
    if (!await abonnementActif(demande.destinataireId)) return res.status(403).json({ error: 'Votre abonnement n est pas actif' });
    const ville = demande.destinataire.ville || demande.expediteur.ville || 'Benin';
    const colocation = await prisma.$transaction(async (tx) => {
      const coloc = await tx.colocation.create({
        data: {
          nom: 'Colocation de ' + demande.expediteur.prenom + ' et ' + demande.destinataire.prenom,
          ville, loyerTotal: 0, nbPlaces: 2, statut: 'ACTIVE',
        },
      });
      await tx.colocataire.createMany({
        data: [
          { utilisateurId: demande.expediteurId, colocId: coloc.id, statut: 'ACTIF' },
          { utilisateurId: demande.destinataireId, colocId: coloc.id, statut: 'ACTIF' },
        ],
      });
      await tx.demandeColocation.update({ where: { id }, data: { statut: 'ACCEPTEE', colocationId: coloc.id } });
      return coloc;
    });
    await creerNotification(demande.expediteurId, 'COLOCATION_ACCEPTEE', 'Demande de colocation acceptee !',
      demande.destinataire.prenom + ' a accepte votre demande de colocation',
      { colocationId: colocation.id });
    return res.json({ message: 'Colocation creee avec succes', colocation });
  } catch (error) {
    console.error('[accepterDemande]', error);
    return res.status(500).json({ error: 'Erreur serveur' });
  }
};

export const rejeterDemande = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user!.id;
    const demande = await prisma.demandeColocation.findUnique({ where: { id }, include: { destinataire: true } });
    if (!demande) return res.status(404).json({ error: 'Demande introuvable' });
    if (demande.destinataireId !== userId) return res.status(403).json({ error: 'Non autorise' });
    if (demande.statut !== 'EN_ATTENTE') return res.status(400).json({ error: 'Demande non modifiable' });
    await prisma.demandeColocation.update({ where: { id }, data: { statut: 'REJETEE' } });
    await creerNotification(demande.expediteurId, 'COLOCATION_REJETEE', 'Demande de colocation refusee',
      demande.destinataire.prenom + ' a refuse votre demande de colocation', {});
    return res.json({ message: 'Demande rejetee' });
  } catch (error) {
    console.error('[rejeterDemande]', error);
    return res.status(500).json({ error: 'Erreur serveur' });
  }
};

export const demandesRecues = async (req: AuthRequest, res: Response) => {
  try {
    const demandes = await prisma.demandeColocation.findMany({
      where: { destinataireId: req.user!.id, statut: 'EN_ATTENTE' },
      include: { expediteur: { select: { id: true, nom: true, prenom: true, photo: true } } },
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
    const demandes = await prisma.demandeColocation.findMany({
      where: { expediteurId: req.user!.id },
      include: { destinataire: { select: { id: true, nom: true, prenom: true, photo: true } } },
      orderBy: { createdAt: 'desc' },
    });
    return res.json(demandes);
  } catch (error) {
    console.error('[demandesEnvoyees]', error);
    return res.status(500).json({ error: 'Erreur serveur' });
  }
};
