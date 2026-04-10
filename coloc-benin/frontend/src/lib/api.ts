// ── lib/api.ts ────────────────────────────────────────────────────────────────
import axios from 'axios';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  headers: { 'Content-Type': 'application/json' },
});

// Injecter le token JWT automatiquement
api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('coloc_token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Gérer l'expiration du token globalement
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

// ── lib/auth.api.ts ───────────────────────────────────────────────────────────
export const authApi = {
  register: (data: {
    nom: string; prenom: string; email: string; motDePasse: string;
    telephone?: string; ville?: string; universite?: string; filiere?: string; niveau?: string;
  }) => api.post('/auth/register', data),

  login: (email: string, motDePasse: string) =>
    api.post<{ token: string; utilisateur: any; abonnementActif: boolean }>('/auth/login', { email, motDePasse }),

  me: () => api.get('/auth/me'),
};

// ── lib/annonces.api.ts ───────────────────────────────────────────────────────
export const annoncesApi = {
  lister: (params?: Record<string, any>) => api.get('/annonces', { params }),
  getById: (id: string) => api.get(`/annonces/${id}`),
  creer: (data: FormData) => api.post('/annonces', data, { headers: { 'Content-Type': 'multipart/form-data' } }),
  modifier: (id: string, data: any) => api.put(`/annonces/${id}`, data),
  supprimer: (id: string) => api.delete(`/annonces/${id}`),
};

// ── lib/colocations.api.ts ────────────────────────────────────────────────────
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

// ── lib/abonnements.api.ts ────────────────────────────────────────────────────
export const abonnementsApi = {
  initier: (operateur: string, telephone: string) =>
    api.post('/abonnements/initier', { operateur, telephone }),
  statut: () => api.get('/abonnements/statut'),
  historique: () => api.get('/abonnements/historique'),
};

// ── lib/messagerie.api.ts ─────────────────────────────────────────────────────
export const messagerieApi = {
  conversations: () => api.get('/messagerie/conversations'),
  messages: (userId: string) => api.get(`/messagerie/${userId}`),
  envoyer: (destinataireId: string, contenu: string) =>
    api.post(`/messagerie/${destinataireId}`, { contenu }),
};
