'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRequireAuth } from '../../hooks/useAuth';
import { colocationsApi, annoncesApi, abonnementsApi } from '../../lib/api';
import { Colocation, Annonce, Abonnement } from '../../types';
import { Navbar } from '../../components/layout/Navbar';
import clsx from 'clsx';

export default function DashboardPage() {
  const { user, abonnementActif, isLoading } = useRequireAuth();
  const [colocations, setColocations] = useState<Colocation[]>([]);
  // ✅ Nouveau
  const [abonnement, setAbonnement] = useState<{ actif: boolean; abonnement?: { periodeFin?: string } } | null>(null);
  useEffect(() => {
    if (!user) return;
    colocationsApi.mesColocations().then(r => setColocations(r.data));
    abonnementsApi.statut().then(r => setAbonnement(r.data));
  }, [user]);

  if (isLoading) return <div className="min-h-screen flex items-center justify-center text-gray-400">Chargement...</div>;
  if (!user) return null;

  return (
    <>
      <Navbar />
      <main className="max-w-5xl mx-auto px-4 py-8">
        {/* En-tête */}
        <div className="mb-8">
          <h1 className="text-xl font-semibold">Bonjour, {user.prenom} 👋</h1>
          <p className="text-sm text-gray-500 mt-1">{user.universite || 'Étudiant'} · {user.ville || 'Bénin'}</p>
        </div>

        {/* Bannière abonnement inactif */}
        {!abonnement?.actif && (
          <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-xl flex items-center justify-between">
            <div>
              <p className="font-medium text-amber-800 text-sm">Abonnement inactif</p>
              <p className="text-xs text-amber-700 mt-0.5">Activez votre abonnement (300 FCFA/mois) pour accéder à toutes les fonctionnalités.</p>
            </div>
            <Link href="/abonnement" className="bg-amber-400 hover:bg-amber-500 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors whitespace-nowrap ml-4">
              S'abonner
            </Link>
          </div>
        )}

        {/* Stats rapides */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <StatCard label="Abonnement" value={abonnement?.actif ? 'Actif' : 'Inactif'} ok={!!abonnement?.actif} />
          <StatCard label="Colocations" value={String(colocations.length)} />
          <StatCard label="Membres actifs" value={String(colocations.flatMap(c => c.colocataires.filter(m => m.statut === 'ACTIF')).length)} />
          <StatCard label="Expiration" value={abonnement?.abonnement?.periodeFin ? new Date(abonnement.abonnement.periodeFin).toLocaleDateString('fr-FR') : '—'} />
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Colocations */}
          <section>
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-semibold">Mes colocations</h2>
              <Link href="/colocations" className="text-sm text-primary-600 hover:underline">Voir tout</Link>
            </div>
            {colocations.length === 0 ? (
              <div className="card text-center py-8">
                <p className="text-gray-400 text-sm mb-3">Vous n'êtes dans aucune colocation</p>
                <Link href="/colocations/creer" className="btn-primary text-sm">
                  Créer une colocation
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {colocations.slice(0, 3).map(c => (
                  <Link key={c.id} href={`/colocations/${c.id}`} className="card block hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-sm">{c.nom}</p>
                        <p className="text-xs text-gray-500 mt-0.5">{c.ville} · {c.colocataires.filter(m => m.statut === 'ACTIF').length}/{c.nbPlaces} membres</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-primary-600">{c.maPartLoyer?.toLocaleString() || '—'} FCFA</p>
                        <p className="text-xs text-gray-400">ma part</p>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </section>

          {/* Actions rapides */}
          <section>
            <h2 className="font-semibold mb-3">Actions rapides</h2>
            <div className="space-y-2">
              {[
                { href: '/annonces/creer', label: 'Publier une annonce', disabled: !abonnement?.actif },
                { href: '/annonces', label: 'Rechercher un logement', disabled: false },
                { href: '/colocations/creer', label: 'Créer une colocation', disabled: !abonnement?.actif },
                { href: '/abonnement', label: 'Gérer mon abonnement', disabled: false },
              ].map(({ href, label, disabled }) => (
                <Link
                  key={href}
                  href={disabled ? '/abonnement' : href}
                  className={clsx(
                    'flex items-center justify-between p-3 rounded-xl border text-sm font-medium transition-colors',
                    disabled
                      ? 'border-gray-100 text-gray-300 cursor-not-allowed bg-gray-50'
                      : 'border-primary-100 text-primary-700 bg-primary-50 hover:bg-primary-100'
                  )}
                >
                  {label}
                  {disabled && <span className="text-xs text-amber-500 font-normal">Abonnement requis</span>}
                </Link>
              ))}
            </div>
          </section>
        </div>
      </main>
    </>
  );
}

function StatCard({ label, value, ok }: { label: string; value: string; ok?: boolean }) {
  return (
    <div className="card">
      <p className="text-xs text-gray-500 mb-1">{label}</p>
      <p className={clsx('font-semibold text-base', ok === false ? 'text-red-500' : ok === true ? 'text-teal-600' : 'text-gray-900')}>
        {value}
      </p>
    </div>
  );
}
