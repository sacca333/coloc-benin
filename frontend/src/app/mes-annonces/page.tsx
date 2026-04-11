'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRequireAuth } from '../../hooks/useAuth';
import { Navbar } from '../../components/layout/Navbar';
import { annoncesApi } from '../../lib/api';
import { Annonce } from '../../types';
import clsx from 'clsx';

export default function MesAnnoncesPage() {
  const { user, isLoading } = useRequireAuth();
  const [annonces, setAnnonces] = useState<Annonce[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    annoncesApi.lister()
      .then(r => {
        setAnnonces(r.data.filter((a: Annonce) => a.proprietaireId === user.id));
      })
      .finally(() => setLoading(false));
  }, [user]);

  if (isLoading) return <div className="min-h-screen flex items-center justify-center text-gray-400">Chargement...</div>;

  return (
    <>
      <Navbar />
      <main className="max-w-3xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-xl font-semibold">Mes annonces</h1>
            <p className="text-sm text-gray-500 mt-0.5">{annonces.length} annonce{annonces.length > 1 ? 's' : ''} publiee{annonces.length > 1 ? 's' : ''}</p>
          </div>
          <Link href="/annonces/creer" className="btn-primary text-sm">+ Publier</Link>
        </div>

        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map(i => <div key={i} className="h-24 rounded-2xl bg-gray-100 animate-pulse" />)}
          </div>
        ) : annonces.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-4xl mb-3">📋</p>
            <p className="text-gray-400 text-sm mb-4">Vous n avez pas encore publie d annonce</p>
            <Link href="/annonces/creer" className="btn-primary text-sm">Publier ma premiere annonce</Link>
          </div>
        ) : (
          <div className="space-y-4">
            {annonces.map(a => (
              <Link key={a.id} href={`/annonces/${a.id}`} className="block bg-white rounded-2xl border border-gray-100 p-4 shadow-sm hover:shadow-md transition-all duration-200 hover:-translate-y-0.5">
                <div className="flex gap-4">
                  <div className="w-20 h-16 rounded-xl bg-gray-100 flex-shrink-0 overflow-hidden">
                    {a.photos?.[0]
                      ? <img src={a.photos[0]} alt="" className="w-full h-full object-cover" />
                      : <div className="w-full h-full flex items-center justify-center text-gray-300 text-2xl">🏠</div>
                    }
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span className={clsx('text-xs px-2 py-0.5 rounded-full font-medium', a.type === 'LOGEMENT_DISPONIBLE' ? 'bg-violet-50 text-violet-600' : 'bg-teal-50 text-teal-600')}>
                          {a.type === 'LOGEMENT_DISPONIBLE' ? 'Logement' : 'Place en coloc'}
                        </span>
                        <p className="font-medium text-sm mt-1">{a.quartier || a.adresse || a.ville}</p>
                        <p className="text-xs text-gray-500">{a.ville} · {a.nbPlaces} place{a.nbPlaces > 1 ? 's' : ''}</p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="font-semibold text-sm">{a.loyerTotal.toLocaleString()} FCFA</p>
                        <p className="text-xs text-gray-400">/ mois</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between mt-2">
                      <span className={clsx('text-xs px-2 py-0.5 rounded-full font-medium border', a.statut === 'ACTIVE' ? 'bg-green-50 text-green-600 border-green-200' : 'bg-gray-50 text-gray-400 border-gray-200')}>
                        {a.statut === 'ACTIVE' ? 'Active' : a.statut}
                      </span>
                      <span className="text-xs text-gray-400">{new Date(a.createdAt).toLocaleDateString('fr-FR')}</span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
    </>
  );
}
