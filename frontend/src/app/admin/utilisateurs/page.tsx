'use client';
import { useEffect, useState } from 'react';
import { useRequireAuth } from '../../../hooks/useAuth';
import { Navbar } from '../../../components/layout/Navbar';
import Link from 'next/link';
import api from '../../../lib/api';
import clsx from 'clsx';

interface Utilisateur {
  id: string; nom: string; prenom: string; email: string;
  telephone?: string; ville?: string; typeCompte: string; actif: boolean; createdAt: string;
}

export default function AdminUtilisateursPage() {
  const { user, isLoading } = useRequireAuth();
  const [utilisateurs, setUtilisateurs] = useState<Utilisateur[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  const charger = (p = 1, email = '') => {
    setLoading(true);
    api.get('/admin/utilisateurs', { params: { page: p, email: email || undefined } })
      .then(r => { setUtilisateurs(r.data.utilisateurs); setTotal(r.data.total); })
      .finally(() => setLoading(false));
  };

  useEffect(() => { if (user?.typeCompte === 'ADMIN') charger(); }, [user]);

  const toggleActif = async (id: string, actif: boolean) => {
    await api.patch(`/admin/utilisateurs/${id}/statut`, { actif: !actif });
    setUtilisateurs(prev => prev.map(u => u.id === id ? { ...u, actif: !actif } : u));
  };

  if (isLoading) return <div className="min-h-screen flex items-center justify-center text-gray-400">Chargement...</div>;
  if (user?.typeCompte !== 'ADMIN') return <div className="min-h-screen flex items-center justify-center text-red-400">Accès refusé</div>;

  return (
    <>
      <Navbar />
      <main className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex items-center gap-4 mb-6">
          <Link href="/admin" className="text-sm text-gray-400 hover:text-gray-600">← Admin</Link>
          <h1 className="text-xl font-semibold">Utilisateurs ({total})</h1>
        </div>

        <div className="flex gap-3 mb-4">
          <input
            className="input max-w-xs text-sm"
            placeholder="Rechercher par email..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && charger(1, search)}
          />
          <button onClick={() => charger(1, search)} className="btn-primary text-sm">Rechercher</button>
          <button onClick={() => { setSearch(''); charger(1, ''); }} className="btn-outline text-sm">Réinitialiser</button>
        </div>

        <div className="card p-0 overflow-x-auto">
          <table className="w-full text-sm" style={{ tableLayout: 'fixed' }}>
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 w-48">Utilisateur</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500">Email</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 w-28">Ville</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 w-24">Type</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 w-24">Statut</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 w-28">Inscrit le</th>
                <th className="w-24 px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <tr><td colSpan={7} className="px-4 py-8 text-center text-gray-400">Chargement...</td></tr>
              ) : utilisateurs.map(u => (
                <tr key={u.id} className={clsx('hover:bg-gray-50', !u.actif && 'opacity-50')}>
                  <td className="px-4 py-3 font-medium truncate">{u.prenom} {u.nom}</td>
                  <td className="px-4 py-3 text-gray-500 truncate">{u.email}</td>
                  <td className="px-4 py-3 text-gray-500">{u.ville || '—'}</td>
                  <td className="px-4 py-3">
                    <span className={clsx('text-xs px-2 py-0.5 rounded-full',
                      u.typeCompte === 'ADMIN' ? 'bg-primary-50 text-primary-600' :
                      u.typeCompte === 'PROPRIETAIRE' ? 'bg-amber-50 text-amber-700' : 'bg-gray-100 text-gray-600'
                    )}>{u.typeCompte}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={u.actif ? 'badge-actif' : 'badge-expire'}>{u.actif ? 'Actif' : 'Suspendu'}</span>
                  </td>
                  <td className="px-4 py-3 text-gray-400 text-xs">{new Date(u.createdAt).toLocaleDateString('fr-FR')}</td>
                  <td className="px-4 py-3">
                    {u.typeCompte !== 'ADMIN' && (
                      <button
                        onClick={() => toggleActif(u.id, u.actif)}
                        className={clsx('text-xs font-medium', u.actif ? 'text-red-400 hover:text-red-600' : 'text-teal-500 hover:text-teal-700')}
                      >
                        {u.actif ? 'Suspendre' : 'Activer'}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {total > 20 && (
          <div className="flex items-center justify-center gap-3 mt-4">
            <button disabled={page === 1} onClick={() => { setPage(p => p - 1); charger(page - 1, search); }} className="btn-outline text-sm">Précédent</button>
            <span className="text-sm text-gray-500">Page {page} / {Math.ceil(total / 20)}</span>
            <button disabled={page * 20 >= total} onClick={() => { setPage(p => p + 1); charger(page + 1, search); }} className="btn-outline text-sm">Suivant</button>
          </div>
        )}
      </main>
    </>
  );
}
