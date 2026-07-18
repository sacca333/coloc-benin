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
        import('../lib/api').then(({ abonnementsApi }) => {
          abonnementsApi.statut().then((r) => {
            login(token, res.data, r.data.actif);
          }).catch(() => login(token, res.data, false));
        });
      })
      .catch((err) => {
        // Ne déconnecter QUE si le token est vraiment invalide (401)
        // Ignorer les erreurs réseau ou serveur (500, timeout...)
        if (err?.response?.status === 401) {
          logout();
        } else {
          // Réseau ou serveur HS : garder l'utilisateur connecté avec les infos du token
          const payload = JSON.parse(atob(token.split('.')[1]));
          useAuthStore.setState({
            token,
            user: { id: payload.id, email: payload.email, typeCompte: payload.typeCompte } as any,
            isLoading: false,
          });
        }
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
