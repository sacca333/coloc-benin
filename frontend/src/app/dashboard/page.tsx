'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRequireAuth } from '../../hooks/useAuth';
import { colocationsApi, abonnementsApi, annoncesApi } from '../../lib/api';
import { Colocation, Annonce } from '../../types';
import { Navbar } from '../../components/layout/Navbar';
import clsx from 'clsx';

export default function DashboardPage() {
  const { user, isLoading } = useRequireAuth();
  const [colocations, setColocations] = useState<Colocation[]>([]);
  const [annonces, setAnnonces] = useState<Annonce[]>([]);
  const [abonnement, setAbonnement] = useState<{ actif: boolean; abonnement?: { periodeFin?: string } } | null>(null);
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    if (!user) return;
    const fetchData = async () => {
      try {
        const [coloc, abo, ann] = await Promise.all([
          colocationsApi.mesColocations(),
          abonnementsApi.statut(),
          annoncesApi.lister(),
        ]);
        setColocations(coloc.data || []);
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

  const activeColocations = colocations.filter((c: any) => c.statut === 'ACTIF').length;

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
                <p className="text-sm font-medium text-gray-600">Colocations actives</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{activeColocations}</p>
                <p className="text-xs text-gray-500 mt-2">Total: {colocations.length} colocations</p>
              </div>
              <div className="text-3xl">🤝</div>
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
            <h2 className="text-xl font-bold text-gray-900">Vos colocations</h2>
            <Link href="/colocations" className="text-sm text-primary-600 hover:underline font-medium">Voir tout</Link>
          </div>
          {colocations.length === 0 ? (
            <div className="bg-white rounded-xl border border-gray-100 p-12 text-center">
              <div className="text-4xl mb-3">🏠</div>
              <p className="font-medium text-gray-900">Aucune colocation</p>
              <p className="text-sm text-gray-500 mt-1">Creez ou rejoignez une colocation pour commencer</p>
              <Link href="/colocations" className="inline-block mt-4 px-4 py-2 bg-primary-600 text-white rounded-lg text-sm font-medium">
                Creer une colocation
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {colocations.slice(0, 4).map((coloc: any) => (
                <Link key={coloc.id} href={`/colocations/${coloc.id}`} className="bg-white rounded-xl border border-gray-100 p-4 hover:shadow-md transition-all hover:-translate-y-0.5 block">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900 truncate">{coloc.adresse || 'Adresse non specifiee'}</h3>
                      <p className="text-sm text-gray-600">{coloc.nbColocataires || 0} colocataire{(coloc.nbColocataires || 0) !== 1 ? 's' : ''}</p>
                      <p className="text-xs text-gray-500 mt-1">{coloc.ville || 'Ville'}</p>
                    </div>
                    <div className="text-right ml-4 flex-shrink-0">
                      <p className="font-semibold text-gray-900">{(coloc.montantTotal || 0).toLocaleString()} FCFA</p>
                      <p className="text-xs text-gray-500">Loyer</p>
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


