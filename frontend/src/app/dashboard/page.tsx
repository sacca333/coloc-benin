'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRequireAuth, useAuth } from '../../hooks/useAuth';
import { colocationsApi, abonnementsApi, annoncesApi, photoUrl } from '../../lib/api';
import { Colocation, Annonce } from '../../types';
import { Navbar } from '../../components/layout/Navbar';
import clsx from 'clsx';

export default function DashboardPage() {
  const { user, isLoading } = useRequireAuth();
  const { logout } = useAuth();
  const [colocations, setColocations] = useState<Colocation[]>([]);
  const [annonces, setAnnonces] = useState<Annonce[]>([]);
  const [abonnement, setAbonnement] = useState<{ actif: boolean; abonnement?: { periodeFin?: string } } | null>(null);
  const [loadingData, setLoadingData] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [dataError, setDataError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;

    const fetchData = async () => {
      try {
        setDataError(null);
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
        setDataError(err.message || 'Erreur lors du chargement des données');
      } finally {
        setLoadingData(false);
      }
    };

    fetchData();
  }, [user?.id]);

  if (isLoading) return <div className="min-h-screen flex items-center justify-center text-gray-400">Chargement...</div>;
  if (!user) return null;

  const userPhotoUrl = photoUrl(user.photo);
  const activeColocations = colocations.filter((c: any) => c.statut === 'ACTIF').length;

  return (
    <>
      <Navbar />

      <div className="flex min-h-screen bg-gray-50">
        {/* Sidebar */}
        <aside className={clsx(
          'fixed inset-y-14 left-0 w-64 bg-white border-r border-gray-100 shadow-sm z-30 transition-transform lg:relative lg:inset-auto lg:translate-x-0',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        )}>
          <nav className="p-4 space-y-1">
            {[
              { href: '/dashboard', icon: '📊', label: 'Tableau de bord' },
              { href: '/colocations', icon: '🤝', label: 'Mes colocations' },
              { href: '/annonces', icon: '📋', label: 'Annonces' },
              { href: '/messagerie', icon: '💬', label: 'Messages' },
              { href: '/abonnement', icon: '💳', label: 'Abonnement' },
              { href: '/profil', icon: '👤', label: 'Profil' },
            ].map(({ href, icon, label }) => (
              <Link key={href} href={href} className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                <span className="text-lg">{icon}</span> {label}
              </Link>
            ))}
          </nav>
        </aside>

        {/* Overlay */}
        {sidebarOpen && (
          <div className="fixed inset-0 bg-black/20 z-20 lg:hidden" onClick={() => setSidebarOpen(false)} />
        )}

        {/* Main Content */}
        <main className="flex-1">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Bienvenue, {user.prenom} 👋</h1>
                <p className="text-sm text-gray-500 mt-1">{user.universite || 'Étudiant'} · {user.ville || 'Bénin'}</p>
              </div>

              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="lg:hidden flex items-center justify-center w-10 h-10 rounded-lg hover:bg-gray-100"
              >
                ☰
              </button>
            </div>

            {/* Abonnement Alert */}
            {!abonnement?.actif && (
              <div className="mb-6 p-4 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-xl flex items-center justify-between">
                <div>
                  <p className="font-semibold text-amber-900">⚠️ Abonnement inactif</p>
                  <p className="text-sm text-amber-800 mt-1">Activez votre abonnement (300 FCFA/mois) pour accéder à toutes les fonctionnalités.</p>
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
                    <Link href="/annonces" className="text-xs text-primary-600 hover:underline mt-2 block">Voir les détails →</Link>
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
                      {abonnement?.abonnement?.periodeFin ? `Expire: ${new Date(abonnement.abonnement.periodeFin).toLocaleDateString()}` : 'Non abonné'}
                    </p>
                  </div>
                  <div className="text-3xl">💳</div>
                </div>
              </div>
            </div>

            {/* Main Sections */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Colocations Section - 2 columns */}
              <div className="lg:col-span-2">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold text-gray-900">Vos colocations</h2>
                  <Link href="/colocations" className="text-sm text-primary-600 hover:underline font-medium">Voir tout →</Link>
                </div>

                {colocations.length === 0 ? (
                  <div className="bg-white rounded-xl border border-gray-100 p-12 text-center">
                    <div className="text-4xl mb-3">🏠</div>
                    <p className="font-medium text-gray-900">Aucune colocation</p>
                    <p className="text-sm text-gray-500 mt-1">Créez ou rejoignez une colocation pour commencer</p>
                    <Link href="/colocations" className="inline-block mt-4 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 text-sm font-medium transition-colors">
                      Créer une colocation
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {colocations.slice(0, 3).map((coloc: any) => (
                      <Link key={coloc.id} href={`/colocations/${coloc.id}`} className="bg-white rounded-xl border border-gray-100 p-4 hover:shadow-md transition-all hover:-translate-y-0.5 block">
                        <div className="flex items-start justify-between">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="font-semibold text-gray-900 truncate">{coloc.adresse || 'Adresse non spécifiée'}</h3>
                              <span className={clsx('text-xs px-2 py-0.5 rounded-full font-medium flex-shrink-0',
                                coloc.statut === 'ACTIF' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700')}>
                                {coloc.statut === 'ACTIF' ? '✓ Actif' : coloc.statut}
                              </span>
                            </div>
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

              {/* Sidebar Info */}
              <div>
                {/* Quick Actions */}
                <div className="mb-6">
                  <h3 className="text-sm font-semibold text-gray-900 mb-3">Actions rapides</h3>
                  <div className="space-y-2">
                    <Link href="/annonces" className="flex items-center gap-3 p-3 bg-white rounded-lg border border-gray-100 hover:bg-gray-50 transition-colors">
                      <span className="text-lg">📝</span>
                      <span className="text-sm font-medium text-gray-700">Créer annonce</span>
                    </Link>
                    <Link href="/colocations" className="flex items-center gap-3 p-3 bg-white rounded-lg border border-gray-100 hover:bg-gray-50 transition-colors">
                      <span className="text-lg">➕</span>
                      <span className="text-sm font-medium text-gray-700">Créer colocation</span>
                    </Link>
                    <Link href="/messagerie" className="flex items-center gap-3 p-3 bg-white rounded-lg border border-gray-100 hover:bg-gray-50 transition-colors">
                      <span className="text-lg">💬</span>
                      <span className="text-sm font-medium text-gray-700">Messages</span>
                    </Link>
                  </div>
                </div>

                {/* Profil Card */}
                <div className="bg-white rounded-xl border border-gray-100 p-4">
                  <div className="flex items-center gap-3 mb-4">
                    {userPhotoUrl ? (
                      <img src={userPhotoUrl} alt="" className="w-12 h-12 rounded-full object-cover" />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-primary-100 text-primary-600 flex items-center justify-center font-semibold">
                        {user.prenom[0]}{user.nom[0]}
                      </div>
                    )}
                    <div className="flex-1">
                      <p className="font-medium text-gray-900 text-sm">{user.prenom} {user.nom}</p>
                      <p className="text-xs text-gray-500">{user.email}</p>
                    </div>
                  </div>
                  <div className="border-t border-gray-100 pt-3 space-y-2">
                    <Link href="/profil" className="block text-sm text-gray-700 hover:text-primary-600 transition-colors font-medium">
                      ⚙️ Modifier profil
                    </Link>
                    <button onClick={() => logout()} className="block text-sm text-red-600 hover:text-red-700 transition-colors font-medium w-full text-left">
                      🚪 Déconnexion
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Annonces Section */}
            <div className="mt-12">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900">Vos annonces récentes</h2>
                <Link href="/annonces" className="text-sm text-primary-600 hover:underline font-medium">Voir tout →</Link>
              </div>

              {annonces.length === 0 ? (
                <div className="bg-white rounded-xl border border-gray-100 p-12 text-center">
                  <div className="text-4xl mb-3">📋</div>
                  <p className="font-medium text-gray-900">Aucune annonce</p>
                  <p className="text-sm text-gray-500 mt-1">Publiez une annonce pour attirer des colocataires</p>
                  <Link href="/annonces" className="inline-block mt-4 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 text-sm font-medium transition-colors">
                    Créer une annonce
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
                        <div className="flex items-start justify-between mb-2">
                          <span className="text-xs px-2 py-0.5 rounded-full bg-primary-100 text-primary-700 font-medium">
                            {annonce.type === 'LOGEMENT_DISPONIBLE' ? '🏠' : '📍'} {annonce.type === 'LOGEMENT_DISPONIBLE' ? 'Logement' : 'Place'}
                          </span>
                        </div>
                        <h3 className="font-semibold text-gray-900 text-sm line-clamp-2">{annonce.quartier || annonce.adresse}</h3>
                        <p className="text-xs text-gray-500 mt-1">{annonce.ville} • {annonce.nbPlaces} place{annonce.nbPlaces > 1 ? 's' : ''}</p>
                        <p className="font-bold text-gray-900 mt-3">{annonce.loyerTotal.toLocaleString()} FCFA</p>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </>
  );
}
