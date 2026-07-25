'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRequireAuth } from '../../hooks/useAuth';
import { sauvegardesApi, abonnementsApi, annoncesApi } from '../../lib/api';
import { Annonce } from '../../types';
import { Navbar } from '../../components/layout/Navbar';
import clsx from 'clsx';

export default function DashboardPage() {
  const { user, isLoading } = useRequireAuth();
  const [sauvegardes, setSauvegardes] = useState<Annonce[]>([]); const [annonces, setAnnonces] = useState<Annonce[]>([]);
  const [abonnement, setAbonnement] = useState<{ actif: boolean; abonnement?: { periodeFin?: string } } | null>(null);
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    if (!user) return;
    const fetchData = async () => {
      try {
        const [sauv, abo, ann] = await Promise.all([
          sauvegardesApi.lister(),
          abonnementsApi.statut(),
          annoncesApi.lister(),
        ]);
        setSauvegardes(sauv.data || []);

        setAbonnement(abo.data || null);
        setAnnonces((ann.data || []).filter((a: Annonce) => a.proprietaireId === user.id));
      } catch (err: any) {
        console.error('Erreur chargement dashboard:', err);
      } finally {
        setLoadingData(false);
      }
    };
    fetchData();
  }, [user?.id]);

  if (isLoading || loadingData) return (
    <div className="min-h-screen flex items-center justify-center text-gray-400">Chargement...</div>
  );
  if (!user) return null;


  return (
    <>
      <Navbar />
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Bienvenue, {user.prenom} 👋</h1>
          <p className="text-sm text-gray-500 mt-1">{user.universite || 'Etudiant'} · {user.ville || 'Bénin'}</p>
        </div>

        {/* Abonnement Alert */}
        {!abonnement?.actif && (
          <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-xl flex items-center justify-between">
            <div>
              <p className="font-semibold text-amber-900">Abonnement inactif</p>
              <p className="text-sm text-amber-800 mt-1">Activez votre abonnement (300 FCFA/mois) pour acceder a toutes les fonctionnalites.</p>
            </div>
            <Link href="/abonnement" className="flex-shrink-0 ml-4 px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 font-medium text-sm">
              Activer
            </Link>
          </div>
        )}

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Sauvegardes</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{sauvegardes.length}</p>
                <Link href="/mes-sauvegardes" className="text-xs text-primary-600 hover:underline mt-2 block">Voir tout</Link>
              </div>
              <div className="text-3xl">🤍</div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Vos annonces</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{annonces.length}</p>
                <Link href="/mes-annonces" className="text-xs text-primary-600 hover:underline mt-2 block">Voir les details</Link>
              </div>
              <div className="text-3xl">📋</div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Abonnement</p>
                <div className="flex items-center gap-2 mt-2">
                  <span className={clsx('w-3 h-3 rounded-full', abonnement?.actif ? 'bg-green-500' : 'bg-red-500')} />
                  <p className="text-lg font-semibold text-gray-900">{abonnement?.actif ? 'Actif' : 'Inactif'}</p>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  {abonnement?.abonnement?.periodeFin ? `Expire: ${new Date(abonnement.abonnement.periodeFin).toLocaleDateString()}` : 'Non abonne'}
                </p>
              </div>
              <div className="text-3xl">💳</div>
            </div>
          </div>
        </div>

        {/* Colocations */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900">Vos sauvegardes</h2>
            <Link href="/mes-sauvegardes" className="text-sm text-primary-600 hover:underline font-medium">Voir tout</Link>
          </div>
          {sauvegardes.length === 0 ? (
            <div className="bg-white rounded-xl border border-gray-100 p-12 text-center">
              <div className="text-4xl mb-3">🤍</div>
              <p className="font-medium text-gray-900">Aucune sauvegarde</p>
              <p className="text-sm text-gray-500 mt-1">Sauvegardez des annonces pour les retrouver ici</p>
              <Link href="/annonces" className="inline-block mt-4 px-4 py-2 bg-primary-600 text-white rounded-lg text-sm font-medium">
                Parcourir les annonces
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {sauvegardes.slice(0, 4).map((a: Annonce) => (
                <Link key={a.id} href={`/annonces/${a.id}`} className="bg-white rounded-xl border border-gray-100 p-4 hover:shadow-md transition-all hover:-translate-y-0.5 block">
                  <div className="flex gap-3">
                    <div className="w-16 h-14 rounded-lg bg-gray-100 flex-shrink-0 overflow-hidden">
                      {a.photos?.[0]
                        ? <img src={a.photos[0]} alt="" className="w-full h-full object-cover" />
                        : <div className="w-full h-full flex items-center justify-center text-2xl">🏠</div>
                      }
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-900 text-sm truncate">{a.quartier || a.adresse || a.ville}</p>
                      <p className="text-xs text-gray-500">{a.ville} · {a.nbPlaces} place{a.nbPlaces > 1 ? 's' : ''}</p>
                      <p className="font-bold text-gray-900 text-sm mt-1">{a.loyerTotal.toLocaleString()} FCFA</p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Annonces recentes */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900">Vos annonces recentes</h2>
            <Link href="/mes-annonces" className="text-sm text-primary-600 hover:underline font-medium">Voir tout</Link>
          </div>
          {annonces.length === 0 ? (
            <div className="bg-white rounded-xl border border-gray-100 p-12 text-center">
              <div className="text-4xl mb-3">📋</div>
              <p className="font-medium text-gray-900">Aucune annonce</p>
              <p className="text-sm text-gray-500 mt-1">Publiez une annonce pour attirer des colocataires</p>
              <Link href="/annonces/creer" className="inline-block mt-4 px-4 py-2 bg-primary-600 text-white rounded-lg text-sm font-medium">
                Creer une annonce
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {annonces.slice(0, 4).map((annonce) => (
                <Link key={annonce.id} href={`/annonces/${annonce.id}`} className="bg-white rounded-xl border border-gray-100 overflow-hidden hover:shadow-md transition-all hover:-translate-y-0.5 block">
                  <div className="aspect-video bg-gray-100 overflow-hidden">
                    {annonce.photos[0] && <img src={annonce.photos[0]} alt="" className="w-full h-full object-cover" />}
                  </div>
                  <div className="p-4">
                    <span className="text-xs px-2 py-0.5 rounded-full bg-primary-100 text-primary-700 font-medium">
                      {annonce.type === 'LOGEMENT_DISPONIBLE' ? 'Logement' : 'Place'}
                    </span>
                    <h3 className="font-semibold text-gray-900 text-sm mt-2 line-clamp-2">{annonce.quartier || annonce.adresse}</h3>
                    <p className="text-xs text-gray-500 mt-1">{annonce.ville} · {annonce.nbPlaces} place{annonce.nbPlaces > 1 ? 's' : ''}</p>
                    <p className="font-bold text-gray-900 mt-3">{annonce.loyerTotal.toLocaleString()} FCFA</p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </main>
    </>
  );
}


