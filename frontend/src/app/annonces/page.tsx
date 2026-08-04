'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { sauvegardesApi } from '../../lib/api';
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
    if (!filter) {
      setFiltres({});
    }
  };

  return (
    <>
      <Navbar />
      <main className="max-w-6xl mx-auto px-4 py-8">
        <div className="mb-6">

          {/* Header avec bouton publier */}
          <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
            <h1 className="text-xl font-semibold">Annonces de colocation</h1>
            <Link href="/annonces/creer"
              className="hidden md:flex items-center gap-2 px-4 py-2 rounded-xl bg-sky-700 text-white text-sm font-semibold hover:bg-sky-600 transition-colors shadow-sm">
              <span className="text-lg leading-none">+</span> Publier une annonce
            </Link>
          </div>

          {/* Bouton + rond fixe en bas à droite sur mobile */}
          <Link href="/annonces/creer"
            className="md:hidden fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-14 h-14 rounded-full bg-sky-700 text-white flex items-center justify-center shadow-lg hover:bg-sky-600 transition-colors"
            style={{ fontSize: 28, fontWeight: 300, lineHeight: 1 }}>
            +
          </Link>

          <SearchBar onSearch={setSearchQuery} onFilterChange={handleFilterChange} />

          {(Object.keys(filtres).length > 0 || searchQuery) && (
            <button
              onClick={() => {
                setFiltres({});
                setSearchQuery('');
                setActiveFilter(null);
                setShowFilterPanel(false);
              }}
              className="mt-2 text-xs text-sky-700 hover:underline font-medium"
            >
              ✕ Réinitialiser les filtres
            </button>
          )}
        </div>

        {showFilterPanel && (
          <div className="mb-6 p-4 bg-white rounded-2xl border border-sky-100 shadow-sm space-y-4"
            style={{ boxShadow: '0 4px 20px rgba(7, 89, 133, 0.08)' }}>
            {activeFilter === 'ville' && (
              <div>
                <label className="text-xs font-semibold text-gray-500 mb-2 block uppercase tracking-wide">Ville</label>
                <div className="flex flex-wrap gap-2">
                  {VILLES.map(v => (
                    <button key={v} onClick={() => updateFiltre('ville', v)}
                      className={clsx('px-3 py-1.5 rounded-full text-sm border transition-all', filtres.ville === v ? 'bg-sky-600 text-white border-transparent' : 'border-gray-200 text-gray-600 hover:border-sky-300')}>
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
                      className={clsx('px-4 py-2 rounded-full text-sm border transition-all', filtres.typeAnnonce === t.val ? 'bg-sky-600 text-white border-transparent' : 'border-gray-200 text-gray-600 hover:border-sky-300')}>
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

            {activeFilter === 'sexe' && (
              <div>
                <label className="text-xs font-semibold text-gray-500 mb-2 block uppercase tracking-wide">
                  Sexe du propriétaire
                </label>
                <div className="flex gap-2">
                  {[
                    { val: 'HOMME', label: '👨 Homme' },
                    { val: 'FEMME', label: '👩 Femme' },
                  ].map(s => (
                    <button
                      key={s.val}
                      onClick={() => updateFiltre('sexe', filtres.sexe === s.val ? undefined : s.val)}
                      className={clsx(
                        'px-4 py-2 rounded-full text-sm border transition-all',
                        filtres.sexe === s.val
                          ? 'bg-sky-600 text-white border-transparent'
                          : 'border-gray-200 text-gray-600 hover:border-sky-300'
                      )}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

          </div>
        )}

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


function tempsEcoule(date: string): string {
  const secondes = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
  if (secondes < 60) return "À l'instant";
  const minutes = Math.floor(secondes / 60);
  if (minutes < 60) return `Il y a ${minutes} min`;
  const heures = Math.floor(minutes / 60);
  if (heures < 24) return `Il y a ${heures} h`;
  const jours = Math.floor(heures / 24);
  if (jours < 7) return `Il y a ${jours} jour${jours > 1 ? 's' : ''}`;
  const semaines = Math.floor(jours / 7);
  if (semaines < 4) return `Il y a ${semaines} semaine${semaines > 1 ? 's' : ''}`;
  const mois = Math.floor(jours / 30);
  if (mois < 12) return `Il y a ${mois} mois`;
  return `Il y a ${Math.floor(mois / 12)} an${Math.floor(mois / 12) > 1 ? 's' : ''}`;
}


function AnnonceCard({ annonce }: { annonce: Annonce }) {
  const { user } = useAuth();
  const [sauvegardee, setSauvegardee] = useState(false);
  const [loadingSave, setLoadingSave] = useState(false);

  useEffect(() => {
    if (!user) return;
    sauvegardesApi.verifie(annonce.id)
      .then(r => setSauvegardee(r.data.sauvegardee))
      .catch(() => { });
  }, [annonce.id, user]);

  const handleSauvegarder = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user || loadingSave) return;
    setLoadingSave(true);
    try {
      if (sauvegardee) {
        await sauvegardesApi.supprimer(annonce.id);
        setSauvegardee(false);
      } else {
        await sauvegardesApi.sauvegarder(annonce.id);
        setSauvegardee(true);
      }
    } catch { } finally {
      setLoadingSave(false);
    }
  };

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
              <span className={clsx('text-xs px-2 py-0.5 rounded-full font-medium', annonce.type === 'LOGEMENT_DISPONIBLE' ? 'bg-sky-50 text-sky-800' : 'bg-teal-50 text-teal-600')}>
                {annonce.type === 'LOGEMENT_DISPONIBLE' ? 'Logement' : 'Place en coloc'}
              </span>
              <h3 className="font-medium text-sm mt-1">{annonce.quartier || annonce.adresse || annonce.ville}</h3>
              <p className="text-xs text-gray-500">{annonce.ville} · {annonce.nbPlaces} place{annonce.nbPlaces > 1 ? 's' : ''}</p>
            </div>
            <div className="flex flex-col items-end gap-1 flex-shrink-0">
              <p className="font-semibold text-gray-900">{annonce.loyerTotal.toLocaleString()} FCFA</p>
              <p className="text-xs text-gray-400">/ mois</p>
              {/* Bouton sauvegarder */}
              {user && (
                <button
                  onClick={handleSauvegarder}
                  disabled={loadingSave}
                  className={clsx(
                    'mt-3 flex items-center gap-1 px-2 py-1 rounded-full text-xs transition-all',
                    sauvegardee
                      ? 'bg-sky-800 text-white'
                      : 'bg-blue-300 text-gray-500 hover:bg-sky-800 hover:text-white'
                  )}
                >
                  {sauvegardee ? '❤️' : '🤍'}
                  <span>{sauvegardee ? 'Sauvegardé' : 'Sauvegarder'}</span>
                </button>
              )}
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
          <p className="text-xs text-gray-400 mt-1.5">🕐 {tempsEcoule(annonce.createdAt)}</p>
        </div>
      </div>
    </Link>
  );
}
