'use client';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { colocationsApi } from '../../../lib/api';
import { Colocation } from '../../../types';
import { Navbar } from '../../../components/layout/Navbar';
import { useAuth } from '../../../hooks/useAuth';
import clsx from 'clsx';

export default function ColocDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const [colocation, setColocation] = useState<Colocation | null>(null);
  const [loading, setLoading] = useState(true);

  const charger = () => {
    colocationsApi.getById(id)
      .then(r => setColocation(r.data))
      .finally(() => setLoading(false));
  };

  useEffect(() => { charger(); }, [id]);

  const handleMarquerPaye = async () => {
    await colocationsApi.marquerLoyerPaye(id);
    charger();
  };

  const handleDepart = async (userId: string) => {
    if (!confirm('Marquer ce colocataire comme parti ?')) return;
    await colocationsApi.mettreAJourStatut(id, userId, 'PARTI');
    charger();
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center text-gray-400">Chargement...</div>;
  if (!colocation) return <div className="min-h-screen flex items-center justify-center text-red-400">Colocation introuvable</div>;

  const actifs = colocation.colocataires.filter(c => c.statut === 'ACTIF');
  const moi = colocation.colocataires.find(c => c.utilisateur.id === user?.id);

  return (
    <>
      <Navbar />
      <main className="max-w-3xl mx-auto px-4 py-8">
        {/* En-tête */}
        <div className="card mb-6">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-lg font-semibold">{colocation.nom}</h1>
              <p className="text-sm text-gray-500 mt-0.5">{colocation.adresse ? `${colocation.adresse}, ` : ''}{colocation.ville}</p>
            </div>
            <span className={clsx(
              'text-xs px-2 py-1 rounded-full font-medium',
              colocation.statut === 'ACTIVE' ? 'badge-actif' :
                colocation.statut === 'FERMEE' ? 'badge-expire' : 'badge-attente'
            )}>
              {colocation.statut === 'ACTIVE' ? 'Active' : colocation.statut === 'FERMEE' ? 'Fermée' : 'En attente'}
            </span>
          </div>

          <div className="grid grid-cols-3 gap-4 mt-4 pt-4 border-t border-gray-50">
            <div>
              <p className="text-xs text-gray-400">Loyer total</p>
              <p className="font-semibold">{colocation.loyerTotal.toLocaleString()} FCFA</p>
            </div>
            <div>
              <p className="text-xs text-gray-400">Places</p>
              <p className="font-semibold">{actifs.length}/{colocation.nbPlaces}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400">Ma part</p>
              <p className="font-semibold text-primary-600">{moi?.partLoyer?.toLocaleString() || '—'} FCFA</p>
            </div>
          </div>
        </div>

        {/* Membres */}
        <div className="card mb-6">
          <h2 className="font-semibold mb-4">Colocataires ({actifs.length})</h2>
          <div className="space-y-3">
            {colocation.colocataires.map(c => (
              <div key={c.id} className={clsx('flex items-center justify-between p-3 rounded-lg', c.statut === 'PARTI' ? 'opacity-40' : 'bg-gray-50')}>
                <div className="flex items-center gap-3">
                  {c.utilisateur.photo
                    ? <img src={c.utilisateur.photo} alt="" className="w-9 h-9 rounded-full object-cover" />
                    : <span className="w-9 h-9 rounded-full bg-primary-100 text-primary-600 flex items-center justify-center text-sm font-medium">
                      {c.utilisateur.prenom[0]}{c.utilisateur.nom[0]}
                    </span>
                  }
                  <div>
                    <p className="text-sm font-medium">{c.utilisateur.prenom} {c.utilisateur.nom}</p>
                    <p className="text-xs text-gray-400">{c.utilisateur.universite || 'Étudiant'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <p className="text-sm font-medium">{c.partLoyer?.toLocaleString() || '—'} FCFA</p>
                    <p className={clsx('text-xs', c.loierConfirme ? 'text-teal-500' : 'text-gray-400')}>
                      {c.loierConfirme ? 'Loyer confirmé' : 'En attente'}
                    </p>
                  </div>
                  {c.statut === 'PARTI' && <span className="badge-expire text-xs">Parti</span>}
                  {c.statut === 'ACTIF' && c.utilisateur.id !== user?.id && (
                    <button onClick={() => handleDepart(c.utilisateur.id)} className="text-xs text-red-400 hover:text-red-600">
                      Marquer parti
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Mon loyer */}
          {moi?.statut === 'ACTIF' && (
            <div className="mt-4 pt-4 border-t border-gray-50">
              <button
                onClick={handleMarquerPaye}
                disabled={moi.loierConfirme}
                className={clsx('btn-outline w-full text-sm', moi.loierConfirme && 'opacity-50 cursor-not-allowed')}
              >
                {moi.loierConfirme ? '✓ J\'ai confirmé mon paiement ce mois' : 'Confirmer que j\'ai payé ma part'}
              </button>
              <p className="text-xs text-gray-400 text-center mt-1">Suivi interne uniquement — ne remplace pas le vrai paiement au propriétaire</p>
            </div>
          )}
        </div>
      </main>
    </>
  );
}