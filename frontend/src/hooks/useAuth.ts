// ── hooks/useAuth.ts ──────────────────────────────────────────────────────────
'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '../lib/store/auth.store';
import { authApi } from '../lib/api';

export function useAuth() {
  const store = useAuthStore();
  return store;
}

// Initialise l'état auth au chargement de l'app (depuis le token localStorage)
export function useAuthInit() {
  const { login, logout } = useAuthStore();

  useEffect(() => {
    const token = localStorage.getItem('coloc_token');
    if (!token) {
      useAuthStore.setState({ isLoading: false });
      return;
    }
    authApi.me()
      .then((res) => {
        // On a le user mais on recharge aussi le statut d'abonnement
        import('../lib/api').then(({ abonnementsApi }) => {
          abonnementsApi.statut().then((r) => {
            login(token, res.data, r.data.actif);
          }).catch(() => login(token, res.data, false));
        });
      })
      .catch(() => {
        logout();
        useAuthStore.setState({ isLoading: false });
      });
  }, []);
}

// Guard : redirige vers /auth/login si non connecté
export function useRequireAuth() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !user) router.push('/auth/login');
  }, [user, isLoading]);

  return { user, isLoading };
}

// Guard : redirige vers /abonnement si abonnement inactif
export function useRequireAbonnement() {
  const { user, abonnementActif, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && user && !abonnementActif) router.push('/abonnement');
  }, [user, abonnementActif, isLoading]);

  return { user, abonnementActif, isLoading };
}
