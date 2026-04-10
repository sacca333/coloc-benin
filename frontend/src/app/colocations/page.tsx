'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { colocationsApi } from '../../lib/api';
import { Colocation } from '../../types';
import { Navbar } from '../../components/layout/Navbar';
import { useRequireAuth } from '../../hooks/useAuth';
import clsx from 'clsx';

export default function ColocationsPage() {
  const { user, isLoading } = useRequireAuth();
  const [colocations, setColocations] = useState<Colocation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    colocationsApi.mesColocations()
      .then(r => setColocations(r.data))
      .finally(() => setLoading(false));
  }, [user]);

  if (isLoading || loading) return <div className="min-h-screen flex items-center justify-center text-gray-400">Chargement...</div>;

  return (
    <>
      <Navbar />
      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-xl font-semibold">Mes colocations</h1>
            <p className="text-sm text-gray-500 mt-0.5">{colocations.length} colocation{colocations.length > 1 ? 's' : ''}</p>
          </div>
          <Link href="/colocations/creer" className="btn-primary text-sm">
            Créer une colocation
          </Link>
        </div>

        {colocations.length === 0 ? (
          <div className="card text-center py-16">
            <p className="text-gray-400 mb-4">Vous n'êtes dans aucune colocation pour le moment.</p>
            <div className="flex gap-3 justify-center">
              <Link href="/colocations/creer" className="btn-primary text-sm">Créer une colocation</Link>
              <Link href="/annonces" className="btn-outline text-sm">Voir les annonces</Link>
            </div>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-4">
            {colocations.map(c => (
              <Link key={c.id} href={`/colocations/${c.id}`} className="card hover:shadow-md transition-shadow block">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-semibold text-base">{c.nom}</h3>
                    <p className="text-xs text-gray-500 mt-0.5">{c.adresse ? `${c.adresse}, ` : ''}{c.ville}</p>
                  </div>
                  <span className={clsx('text-xs px-2 py-0.5 rounded-full font-medium',
                    c.statut === 'ACTIVE' ? 'badge-actif' :
                    c.statut === 'FERMEE' ? 'badge-expire' : 'badge-attente'
                  )}>
                    {c.statut === 'ACTIVE' ? 'Active' : c.statut === 'FERMEE' ? 'Fermée' : 'En attente'}
                  </span>
                </div>

                {/* Membres */}
                <div className="flex items-center gap-1 mb-3">
                  {c.colocataires.filter(m => m.statut === 'ACTIF').slice(0, 4).map(m => (
                    <div key={m.id} className="w-7 h-7 rounded-full bg-primary-100 text-primary-600 flex items-center justify-center text-xs font-medium border-2 border-white -ml-1 first:ml-0">
                      {m.utilisateur.prenom[0]}
                    </div>
                  ))}
                  <span className="text-xs text-gray-400 ml-2">
                    {c.colocataires.filter(m => m.statut === 'ACTIF').length}/{c.nbPlaces} membres
                  </span>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-gray-50">
                  <div>
                    <p className="text-xs text-gray-400">Loyer total</p>
                    <p className="font-medium text-sm">{c.loyerTotal.toLocaleString()} FCFA</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-400">Ma part</p>
                    <p className="font-medium text-sm text-primary-600">{c.maPartLoyer?.toLocaleString() || '—'} FCFA</p>
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
