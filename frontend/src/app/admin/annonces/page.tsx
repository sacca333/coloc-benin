'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRequireAuth } from '../../../hooks/useAuth';
import { Navbar } from '../../../components/layout/Navbar';
import api from '../../../lib/api';
import clsx from 'clsx';

interface AnnonceAdmin {
  id: string; type: string; ville: string; loyerTotal: number; statut: string; createdAt: string;
  proprietaire: { nom: string; prenom: string; email: string };
}

const STATUTS = ['ACTIVE', 'INACTIVE', 'MODEREE', 'SUPPRIMEE'];

export default function AdminAnnoncesPage() {
  const { user, isLoading } = useRequireAuth();
  const [annonces, setAnnonces] = useState<AnnonceAdmin[]>([]);
  const [statut, setStatut] = useState('ACTIVE');
  const [loading, setLoading] = useState(true);

  const charger = (s: string) => {
    setLoading(true);
    api.get('/admin/annonces', { params: { statut: s } })
      .then(r => setAnnonces(r.data))
      .finally(() => setLoading(false));
  };

  useEffect(() => { if (user?.typeCompte === 'ADMIN') charger(statut); }, [user, statut]);

  const changerStatut = async (id: string, newStatut: string) => {
    await api.patch(`/admin/annonces/${id}/statut`, { statut: newStatut });
    setAnnonces(prev => prev.filter(a => a.id !== id));
  };

  if (isLoading) return <div className="min-h-screen flex items-center justify-center text-gray-400">Chargement...</div>;
  if (user?.typeCompte !== 'ADMIN') return <div className="min-h-screen flex items-center justify-center text-red-400">Accès refusé</div>;

  return (
    <>
      <Navbar />
      <main className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex items-center gap-4 mb-6">
          <Link href="/admin" className="text-sm text-gray-400 hover:text-gray-600">← Admin</Link>
          <h1 className="text-xl font-semibold">Modération des annonces</h1>
        </div>

        <div className="flex gap-2 mb-5">
          {STATUTS.map(s => (
            <button
              key={s}
              onClick={() => setStatut(s)}
              className={clsx('px-3 py-1.5 rounded-lg text-sm font-medium transition-colors',
                statut === s ? 'bg-primary-400 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              )}
            >
              {s}
            </button>
          ))}
        </div>

        <div className="card p-0 divide-y divide-gray-50">
          {loading ? (
            <div className="px-5 py-8 text-center text-gray-400">Chargement...</div>
          ) : annonces.length === 0 ? (
            <div className="px-5 py-8 text-center text-gray-400">Aucune annonce avec ce statut</div>
          ) : annonces.map(a => (
            <div key={a.id} className="flex items-center justify-between px-5 py-4 gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs text-gray-400">{a.type === 'LOGEMENT_DISPONIBLE' ? 'Logement' : 'Place coloc'}</span>
                  <span className="font-medium text-sm">{a.ville}</span>
                  <span className="text-sm text-gray-500">· {a.loyerTotal.toLocaleString()} FCFA</span>
                </div>
                <p className="text-xs text-gray-400 mt-0.5">
                  Par {a.proprietaire.prenom} {a.proprietaire.nom} · {a.proprietaire.email}
                  · {new Date(a.createdAt).toLocaleDateString('fr-FR')}
                </p>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <Link href={`/annonces/${a.id}`} target="_blank" className="text-xs text-primary-500 hover:underline">Voir</Link>
                {statut === 'ACTIVE' && (
                  <>
                    <button onClick={() => changerStatut(a.id, 'MODEREE')} className="text-xs text-amber-500 hover:text-amber-700 font-medium">Modérer</button>
                    <button onClick={() => changerStatut(a.id, 'SUPPRIMEE')} className="text-xs text-red-400 hover:text-red-600 font-medium">Supprimer</button>
                  </>
                )}
                {statut === 'MODEREE' && (
                  <>
                    <button onClick={() => changerStatut(a.id, 'ACTIVE')} className="text-xs text-teal-500 hover:text-teal-700 font-medium">Réactiver</button>
                    <button onClick={() => changerStatut(a.id, 'SUPPRIMEE')} className="text-xs text-red-400 hover:text-red-600 font-medium">Supprimer</button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      </main>
    </>
  );
}
