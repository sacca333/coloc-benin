// ── lib/store/auth.store.ts ───────────────────────────────────────────────────
import { create } from 'zustand';
import { Utilisateur } from '../../types';

interface AuthStore {
  user: Utilisateur | null;
  token: string | null;
  abonnementActif: boolean;
  isLoading: boolean;
  login: (token: string, user: Utilisateur, abonnementActif: boolean) => void;
  logout: () => void;
  setAbonnementActif: (actif: boolean) => void;
  setUser: (user: Utilisateur) => void;
}

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  token: null,
  abonnementActif: false,
  isLoading: true,

  login: (token, user, abonnementActif) => {
    if (typeof window !== 'undefined') localStorage.setItem('coloc_token', token);
    set({ token, user, abonnementActif, isLoading: false });
  },

  logout: () => {
    if (typeof window !== 'undefined') localStorage.removeItem('coloc_token');
    set({ token: null, user: null, abonnementActif: false });
  },

  setAbonnementActif: (actif) => set({ abonnementActif: actif }),
  setUser: (user) => set({ user }),
}));
