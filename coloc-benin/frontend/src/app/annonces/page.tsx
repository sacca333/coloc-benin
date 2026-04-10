'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { annoncesApi } from '../../lib/api';
import { Annonce, FiltresAnnonce } from '../../types';
import { Navbar } from '../../components/layout/Navbar';
import { useAuth } from '../../hooks/useAuth';
import clsx from 'clsx';

const VILLES = ['Cotonou', 'Porto-Novo', 'Parakou', 'Abomey-Calavi', 'Bohicon', 'Natitingou'];
const EQUIPEMENTS = ['wifi', 'eau', 'électricité', 'cuisine', 'meublé', 'transport'];

export default function AnnoncesPage() {
  const { abonnementActif } = useAuth();
  const [annonces, setAnnonces] = useState<Annonce[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtres, setFiltres] = useState<FiltresAnnonce>({});

  useEffect(() => {
    setLoading(true);
    annoncesApi.lister(filtres)
      .then(r => setAnnonces(r.data))
      .finally(() => setLoading(false));
  }, [filtres]);

  const updateFiltre = (key: keyof FiltresAnnonce, value: any) => {
    setFiltres(prev => ({ ...prev, [key]: value || undefined }));
  };

  return (
    <>
      <Navbar />
      <main className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-xl font-semibold">Annonces de colocation</h1>
            <p className="text-sm text-gray-500 mt-0.5">{annonces.length} résultat{annonces.length > 1 ? 's' : ''}</p>
          </div>
          {abonnementActif && (
            <Link href="/annonces/creer" className="btn-primary text-sm">
              Publier une annonce
            </Link>
          )}
        </div>

        <div className="grid md:grid-cols-4 gap-6">
          {/* Filtres */}
          <aside className="md:col-span-1">
            <div className="card sticky top-20">
              <h2 className="font-medium text-sm mb-4">Filtres</h2>

              <div className="space-y-4">
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">Ville</label>
                  <select className="input text-sm" onChange={e => updateFiltre('ville', e.target.value)}>
                    <option value="">Toutes les villes</option>
                    {VILLES.map(v => <option key={v} value={v}>{v}</option>)}
                  </select>
                </div>

                <div>
                  <label className="text-xs text-gray-500 mb-1 block">Type</label>
                  <select className="input text-sm" onChange={e => updateFiltre('typeAnnonce', e.target.value)}>
                    <option value="">Tous les types</option>
                    <option value="LOGEMENT_DISPONIBLE">Logement disponible</option>
                    <option value="PLACE_EN_COLOCATION">Place en colocation</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs text-gray-500 mb-1 block">Budget max (FCFA/mois)</label>
                  <input
                    type="number"
                    className="input text-sm"
                    placeholder="Ex : 30000"
                    onChange={e => updateFiltre('budgetMax', Number(e.target.value))}
                  />
                </div>

                <div>
                  <label className="text-xs text-gray-500 mb-2 block">Équipements</label>
                  <div className="flex flex-wrap gap-1.5">
                    {EQUIPEMENTS.map(eq => (
                      <button
                        key={eq}
                        onClick={() => {
                          const current = filtres.equipements || [];
                          updateFiltre('equipements', current.includes(eq) ? current.filter(e => e !== eq) : [...current, eq]);
                        }}
                        className={clsx(
                          'text-xs px-2 py-1 rounded-full border transition-colors',
                          (filtres.equipements || []).includes(eq)
                            ? 'bg-primary-400 text-white border-primary-400'
                            : 'border-gray-200 text-gray-600 hover:border-primary-300'
                        )}
                      >
                        {eq}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </aside>

          {/* Liste annonces */}
          <div className="md:col-span-3">
            {loading ? (
              <div className="grid gap-4">
                {[1, 2, 3].map(i => <div key={i} className="card h-32 animate-pulse bg-gray-50" />)}
              </div>
            ) : annonces.length === 0 ? (
              <div className="card text-center py-12">
                <p className="text-gray-400">Aucune annonce ne correspond à vos critères.</p>
              </div>
            ) : (
              <div className="grid gap-4">
                {annonces.map(annonce => (
                  <AnnonceCard key={annonce.id} annonce={annonce} />
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </>
  );
}

function AnnonceCard({ annonce }: { annonce: Annonce }) {
  return (
    <Link href={`/annonces/${annonce.id}`} className="card hover:shadow-md transition-shadow block">
      <div className="flex gap-4">
        {/* Photo */}
        <div className="w-24 h-20 rounded-lg bg-gray-100 flex-shrink-0 overflow-hidden">
          {annonce.photos[0]
            ? <img src={annonce.photos[0]} alt="" className="w-full h-full object-cover" />
            : <div className="w-full h-full flex items-center justify-center text-gray-300 text-2xl">🏠</div>
          }
        </div>

        {/* Infos */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div>
              <span className={clsx(
                'text-xs px-2 py-0.5 rounded-full font-medium',
                annonce.type === 'LOGEMENT_DISPONIBLE' ? 'bg-primary-50 text-primary-600' : 'bg-teal-50 text-teal-600'
              )}>
                {annonce.type === 'LOGEMENT_DISPONIBLE' ? 'Logement' : 'Place en coloc'}
              </span>
              <h3 className="font-medium text-sm mt-1">{annonce.quartier || annonce.adresse || annonce.ville}</h3>
              <p className="text-xs text-gray-500">{annonce.ville} · {annonce.nbPlaces} place{annonce.nbPlaces > 1 ? 's' : ''}</p>
            </div>
            <div className="text-right flex-shrink-0">
              <p className="font-semibold text-gray-900">{annonce.loyerTotal.toLocaleString()} FCFA</p>
              <p className="text-xs text-gray-400">/ mois</p>
            </div>
          </div>

          {annonce.equipements.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {annonce.equipements.slice(0, 4).map(eq => (
                <span key={eq} className="text-xs text-gray-500 bg-gray-50 border border-gray-100 px-1.5 py-0.5 rounded">
                  {eq}
                </span>
              ))}
              {annonce.equipements.length > 4 && (
                <span className="text-xs text-gray-400">+{annonce.equipements.length - 4}</span>
              )}
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}
