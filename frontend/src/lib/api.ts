import axios from 'axios';

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('coloc_token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401 && typeof window !== 'undefined') {
      localStorage.removeItem('coloc_token');
      window.location.href = '/auth/login';
    }
    return Promise.reject(err);
  }
);

export default api;

export function photoUrl(path: string | null | undefined): string | null {
  if (!path) return null;
  if (path.startsWith('http')) return path;
  const base = process.env.NEXT_PUBLIC_API_URL
    ? process.env.NEXT_PUBLIC_API_URL.replace('/api', '')
    : 'http://localhost:4000';
  return base + path;
}

export const authApi = {
  register: (data: {
    nom: string; prenom: string; email: string; motDePasse: string; sexe: string;
    telephone?: string; ville?: string; universite?: string; filiere?: string; niveau?: string;
  }) => api.post('/auth/register', data),
  login: (email: string, motDePasse: string) =>
    api.post<{ token: string; utilisateur: any; abonnementActif: boolean }>('/auth/login', { email, motDePasse }),
  me: () => api.get('/auth/me'),
};

export const annoncesApi = {
  lister: (params?: Record<string, any>) => api.get('/annonces', { params }),
  getById: (id: string) => api.get(`/annonces/${id}`),
  creer: (data: FormData) => api.post('/annonces', data, { headers: { 'Content-Type': 'multipart/form-data' } }),
  modifier: (id: string, data: any) => api.put(`/annonces/${id}`, data),
  supprimer: (id: string) => api.delete(`/annonces/${id}`),
};

export const colocationsApi = {
  mesColocations: () => api.get('/colocations'),
  getById: (id: string) => api.get(`/colocations/${id}`),
  creer: (data: any) => api.post('/colocations', data),
  inviter: (id: string, email: string) => api.post(`/colocations/${id}/inviter`, { email }),
  accepter: (id: string, token: string) => api.post(`/colocations/${id}/accepter/${token}`),
  marquerLoyerPaye: (id: string) => api.patch(`/colocations/${id}/loyer-paye`),
  mettreAJourStatut: (id: string, userId: string, statut: string) =>
    api.patch(`/colocations/${id}/colocataires/${userId}/statut`, { statut }),
};

export const abonnementsApi = {
  initier: (operateur: string, telephone: string) =>
    api.post('/abonnements/initier', { operateur, telephone }),
  statut: () => api.get('/abonnements/statut'),
  historique: () => api.get('/abonnements/historique'),
  confirmerKkiapay: (transactionId: string) =>
    api.post('/abonnements/confirmer-kkiapay', { transactionId }),
};

export const messagerieApi = {
  conversations: () => api.get('/messagerie/conversations'),
  messages: (userId: string) => api.get(`/messagerie/${userId}`),
  envoyer: (destinataireId: string, contenu: string) =>
    api.post(`/messagerie/${destinataireId}`, { contenu }),
};

// Demandes colocation
export const demandesColApi = {
  envoyer: (destinataireId: string, message?: string) => api.post('/demandes-colocation', { destinataireId, message }),
  accepter: (id: string) => api.post(`/demandes-colocation/${id}/accepter`),
  rejeter: (id: string) => api.post(`/demandes-colocation/${id}/rejeter`),
  recues: () => api.get('/demandes-colocation/recues'),
  envoyees: () => api.get('/demandes-colocation/envoyees'),
};

// Notifications
export const notificationsApi = {
  toutes: () => api.get('/notifications'),
  nonLuesCount: () => api.get('/notifications/non-lues/count'),
  marquerLu: (id: string) => api.patch(`/notifications/${id}/lu`),
  toutMarquerLu: () => api.patch('/notifications/tout-lu'),
};

// Blocages
export const blocagesApi = {
  bloquer: (bloqueId: string) => api.post('/blocages', { bloqueId }),
  debloquer: (bloqueId: string) => api.delete(`/blocages/${bloqueId}`),
  liste: () => api.get('/blocages'),
  verifie: (userId: string) => api.get(`/blocages/verifie/${userId}`),
};
