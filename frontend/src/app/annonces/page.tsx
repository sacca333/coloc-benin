'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { annoncesApi } from '../../lib/api';
import { Annonce, FiltresAnnonce } from '../../types';
import { Navbar } from '../../components/layout/Navbar';
import { SearchBar } from '../../components/ui/SearchBar';
import { useAuth } from '../../hooks/useAuth';
import clsx from 'clsx';

const VILLES = ['Cotonou', 'Porto-Novo', 'Parakou', 'Abomey-Calavi', 'Bohicon', 'Natitingou'];
const EQUIPEMENTS = ['wifi', 'eau', 'electricite', 'cuisine', 'meuble', 'transport'];

export default function AnnoncesPage() {
  const { user } = useAuth();
  const [annonces, setAnnonces] = useState<Annonce[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtres, setFiltres] = useState<FiltresAnnonce>({});
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<string | null>(null);
  const [showFilterPanel, setShowFilterPanel] = useState(false);

  useEffect(() => {
    setLoading(true);
    annoncesApi.lister(filtres)
      .then(r => {
        const filtered = user
          ? r.data.filter((a: Annonce) => a.proprietaireId !== user.id)
          : r.data;
        setAnnonces(filtered);
      })
      .finally(() => setLoading(false));
  }, [filtres, user]);

  // Filtrage local par recherche texte
  const annoncesFiltered = annonces.filter(a => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      a.ville?.toLowerCase().includes(q) ||
      a.quartier?.toLowerCase().includes(q) ||
      a.adresse?.toLowerCase().includes(q) ||
      a.description?.toLowerCase().includes(q)
    );
  });

  const updateFiltre = (key: keyof FiltresAnnonce, value: any) => {
    setFiltres(prev => ({ ...prev, [key]: value || undefined }));
  };

  const handleFilterChange = (filter: string) => {
    setActiveFilter(filter || null);
    setShowFilterPanel(!!filter);
  };

  return (
    <>
      <Navbar />
      <main className="max-w-6xl mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-xl font-semibold mb-4">Annonces de colocation</h1>

          {/* SearchBar moderne */}
          <SearchBar
            onSearch={setSearchQuery}
            onFilterChange={handleFilterChange}
          />
        </div>

        {/* Panneau filtres avances (visible selon chip actif) */}
        {showFilterPanel && (
          <div className="mb-6 p-4 bg-white rounded-2xl border border-violet-100 shadow-sm space-y-4"
            style={{ boxShadow: '0 4px 20px rgba(123, 97, 255, 0.08)' }}
          >
            {activeFilter === 'ville' && (
              <div>
                <label className="text-xs font-semibold text-gray-500 mb-2 block uppercase tracking-wide">Ville</label>
                <div className="flex flex-wrap gap-2">
                  {VILLES.map(v => (
                    <button key={v} onClick={() => updateFiltre('ville', v)}
                      className={clsx('px-3 py-1.5 rounded-full text-sm border transition-all', filtres.ville === v ? 'bg-violet-600 text-white border-transparent' : 'border-gray-200 text-gray-600 hover:border-violet-300')}>
                      {v}
                    </button>
                  ))}
                </div>
              </div>
            )}
            {activeFilter === 'type' && (
              <div>
                <label className="text-xs font-semibold text-gray-500 mb-2 block uppercase tracking-wide">Type d annonce</label>
                <div className="flex gap-2">
                  {[{ val: 'LOGEMENT_DISPONIBLE', label: 'Logement disponible' }, { val: 'PLACE_EN_COLOCATION', label: 'Place en colocation' }].map(t => (
                    <button key={t.val} onClick={() => updateFiltre('typeAnnonce', t.val)}
                      className={clsx('px-4 py-2 rounded-full text-sm border transition-all', filtres.typeAnnonce === t.val ? 'bg-violet-600 text-white border-transparent' : 'border-gray-200 text-gray-600 hover:border-violet-300')}>
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>
            )}
            {activeFilter === 'budget' && (
              <div>
                <label className="text-xs font-semibold text-gray-500 mb-2 block uppercase tracking-wide">Budget max (FCFA/mois)</label>
                <input type="number" className="input text-sm max-w-xs" placeholder="Ex : 30000"
                  onChange={e => updateFiltre('budgetMax', Number(e.target.value))} />
              </div>
            )}
            {activeFilter === 'equipements' && (
              <div>
                <label className="text-xs font-semibold text-gray-500 mb-2 block uppercase tracking-wide">Equipements</label>
                <div className="flex flex-wrap gap-2">
                  {EQUIPEMENTS.map(eq => (
                    <button key={eq} onClick={() => {
                      const current = filtres.equipements || [];
                      updateFiltre('equipements', current.includes(eq) ? current.filter(e => e !== eq) : [...current, eq]);
                    }} className={clsx('px-3 py-1.5 rounded-full text-sm border transition-all', (filtres.equipements || []).includes(eq) ? 'bg-violet-600 text-white border-transparent' : 'border-gray-200 text-gray-600 hover:border-violet-300')}>
                      {eq}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Resultats */}
        <div className="mb-3">
          <p className="text-sm text-gray-500">{annoncesFiltered.length} resultat{annoncesFiltered.length > 1 ? 's' : ''}</p>
        </div>

        {loading ? (
          <div className="grid gap-4">{[1, 2, 3].map(i => <div key={i} className="card h-32 animate-pulse bg-gray-50" />)}</div>
        ) : annoncesFiltered.length === 0 ? (
          <div className="card text-center py-12">
            <p className="text-gray-400">Aucune annonce ne correspond a vos criteres.</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-4">
            {annoncesFiltered.map(annonce => <AnnonceCard key={annonce.id} annonce={annonce} />)}
          </div>
        )}
      </main>
    </>
  );
}

function AnnonceCard({ annonce }: { annonce: Annonce }) {
  return (
    <Link href={`/annonces/${annonce.id}`} className="card hover:shadow-md transition-all duration-200 block hover:-translate-y-0.5">
      <div className="flex gap-4">
        <div className="w-24 h-20 rounded-xl bg-gray-100 flex-shrink-0 overflow-hidden">
          {annonce.photos[0]
            ? <img src={annonce.photos[0]} alt="" className="w-full h-full object-cover" />
            : <div className="w-full h-full flex items-center justify-center text-gray-300 text-2xl">🏠</div>
          }
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div>
              <span className={clsx('text-xs px-2 py-0.5 rounded-full font-medium', annonce.type === 'LOGEMENT_DISPONIBLE' ? 'bg-violet-50 text-violet-600' : 'bg-teal-50 text-teal-600')}>
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
                <span key={eq} className="text-xs text-gray-500 bg-gray-50 border border-gray-100 px-1.5 py-0.5 rounded-full">{eq}</span>
              ))}
              {annonce.equipements.length > 4 && <span className="text-xs text-gray-400">+{annonce.equipements.length - 4}</span>}
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}
