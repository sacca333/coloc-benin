// ── types/index.ts ────────────────────────────────────────────────────────────

export type TypeCompte = 'ETUDIANT' | 'PROPRIETAIRE' | 'ADMIN';
export type Sexe = 'HOMME' | 'FEMME';
export type StatutAbonnement = 'ACTIF' | 'EXPIRE' | 'EN_ATTENTE' | 'ECHEC';
export type OperateurPaiement = 'MOMO' | 'CCASH' | 'MOOV_MONEY';
export type TypeAnnonce = 'LOGEMENT_DISPONIBLE' | 'PLACE_EN_COLOCATION';
export type StatutAnnonce = 'ACTIVE' | 'INACTIVE' | 'MODEREE' | 'SUPPRIMEE';
export type StatutColocation = 'ACTIVE' | 'EN_ATTENTE' | 'FERMEE';
export type StatutColocataire = 'ACTIF' | 'EN_ATTENTE' | 'PARTI';

export interface Utilisateur {
  id: string;
  nom: string;
  prenom: string;
  email: string;
  telephone?: string;
  ville?: string;
  universite?: string;
  filiere?: string;
  niveau?: string;
  typeCompte: TypeCompte;
  photo?: string;
  createdAt: string;
}

export interface Annonce {
  id: string;
  proprietaireId: string;
  type: TypeAnnonce;
  adresse?: string;
  quartier?: string;
  ville: string;
  loyerTotal: number;
  nbPlaces: number;
  nbColocataires?: number;
  caution?: number;
  description?: string;
  equipements: string[];
  photos: string[];
  statut: StatutAnnonce;
  proprietaire: Pick<Utilisateur, 'id' | 'nom' | 'prenom' | 'photo'> & { sexe?: Sexe };
  createdAt: string;
}

export interface Colocataire {
  id: string;
  utilisateur: Pick<Utilisateur, 'id' | 'nom' | 'prenom' | 'photo' | 'universite'>;
  partLoyer?: number;
  statut: StatutColocataire;
  loierConfirme: boolean;
}

export interface Colocation {
  id: string;
  nom: string;
  adresse?: string;
  ville: string;
  loyerTotal: number;
  nbPlaces: number;
  description?: string;
  statut: StatutColocation;
  colocataires: Colocataire[];
  monStatut?: StatutColocataire;
  maPartLoyer?: number;
  createdAt: string;
}

export interface Abonnement {
  id: string;
  operateur: OperateurPaiement;
  montant: number;
  statut: StatutAbonnement;
  datePaiement?: string;
  periodeDebut?: string;
  periodeFin?: string;
}

export interface Message {
  id: string;
  expediteur: Pick<Utilisateur, 'id' | 'nom' | 'prenom' | 'photo'>;
  destinataire: Pick<Utilisateur, 'id' | 'nom' | 'prenom'>;
  contenu: string;
  lu: boolean;
  media?: string
  createdAt: string;
}

export interface AuthState {
  user: Utilisateur | null;
  token: string | null;
  abonnementActif: boolean;
  isLoading: boolean;
}

// Filtres recherche annonces
export interface FiltresAnnonce {
  ville?: string;
  typeAnnonce?: TypeAnnonce;
  budgetMax?: number;
  equipements?: string[];
  nbPlaces?: number;
  sexe?: Sexe;
}

// Filtres recherche colocataires
export interface FiltresColocataire {
  ville?: string;
  universite?: string;
  budgetMax?: number;
  niveau?: string;

}

export interface DemandeColocation {
  id: string;
  expediteurId: string;
  destinataireId: string;
  statut: 'EN_ATTENTE' | 'ACCEPTEE' | 'REJETEE' | 'ANNULEE';
  colocationId?: string;
  message?: string;
  createdAt: string;
  expediteur: { id: string; prenom: string; nom: string; photo?: string };
  destinataire: { id: string; prenom: string; nom: string; photo?: string };
}

export interface Notification {
  id: string;
  userId: string;
  type: 'DEMANDE_COLOCATION' | 'COLOCATION_ACCEPTEE' | 'COLOCATION_REJETEE' | 'NOUVELLE_ANNONCE' | 'BLOCAGE' | 'DEBLOCAGE';
  titre: string;
  message: string;
  lu: boolean;
  data?: Record<string, any>;
  createdAt: string;
}

export interface Blocage {
  id: string;
  bloqueurId: string;
  bloqueId: string;
  createdAt: string;
  bloque: { id: string; prenom: string; nom: string; photo?: string };
}
