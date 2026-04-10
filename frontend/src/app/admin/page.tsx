'use client';
import { useEffect, useState } from 'react';
import { useRequireAuth } from '../../../hooks/useAuth';
import { Navbar } from '../../../components/layout/Navbar';
import api from '../../../lib/api';
import Link from 'next/link';

interface Stats {
  totalUtilisateurs: number;
  abonnementsActifs: number;
  colocationsActives: number;
  annoncesActives: number;
  revenusTotal: number;
  topVilles: { ville: string; count: number }[];
}

export default function AdminDashboard() {
  const { user, isLoading } = useRequireAuth();
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    if (!user || user.typeCompte !== 'ADMIN') return;
    api.get('/admin/stats').then(r => setStats(r.data));
  }, [user]);

  if (isLoading) return <div className="min-h-screen flex items-center justify-center text-gray-400">Chargement...</div>;
  if (user?.typeCompte !== 'ADMIN') return <div className="min-h-screen flex items-center justify-center text-red-400">Accès refusé</div>;

  return (
    <>
      <Navbar />
      <main className="max-w-6xl mx-auto px-4 py-8">
        <h1 className="text-xl font-semibold mb-6">Administration — ColocBénin</h1>

        {/* Métriques */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {[
              { label: 'Utilisateurs', value: stats.totalUtilisateurs, color: 'text-primary-600' },
              { label: 'Abonnements actifs', value: stats.abonnementsActifs, color: 'text-teal-600' },
              { label: 'Colocations actives', value: stats.colocationsActives, color: 'text-blue-600' },
              { label: 'Revenus (FCFA)', value: stats.revenusTotal.toLocaleString(), color: 'text-amber-600' },
            ].map(({ label, value, color }) => (
              <div key={label} className="card">
                <p className="text-xs text-gray-500 mb-1">{label}</p>
                <p className={`text-2xl font-bold ${color}`}>{value}</p>
              </div>
            ))}
          </div>
        )}

        {/* Navigation admin */}
        <div className="grid md:grid-cols-3 gap-4 mb-8">
          {[
            { href: '/admin/utilisateurs', label: 'Gérer les utilisateurs', desc: 'Activer, suspendre, rechercher' },
            { href: '/admin/annonces', label: 'Modérer les annonces', desc: 'Valider, supprimer les abus' },
            { href: '/api/admin/abonnements/export', label: 'Exporter les paiements', desc: 'Télécharger le CSV comptable', external: true },
          ].map(({ href, label, desc, external }) => (
            <Link
              key={href}
              href={href}
              target={external ? '_blank' : undefined}
              className="card hover:shadow-md transition-shadow block"
            >
              <p className="font-medium text-sm">{label}</p>
              <p className="text-xs text-gray-400 mt-1">{desc}</p>
            </Link>
          ))}
        </div>

        {/* Top villes */}
        {stats?.topVilles && stats.topVilles.length > 0 && (
          <div className="card">
            <h2 className="font-semibold text-sm mb-4">Utilisateurs par ville</h2>
            <div className="space-y-2">
              {stats.topVilles.map(({ ville, count }) => (
                <div key={ville} className="flex items-center justify-between">
                  <span className="text-sm text-gray-700">{ville || 'Non renseignée'}</span>
                  <div className="flex items-center gap-3">
                    <div className="w-32 bg-gray-100 rounded-full h-1.5">
                      <div
                        className="bg-primary-400 h-1.5 rounded-full"
                        style={{ width: `${Math.min(100, (count / (stats.topVilles[0]?.count || 1)) * 100)}%` }}
                      />
                    </div>
                    <span className="text-sm font-medium text-gray-900 w-6 text-right">{count}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </>
  );
}
