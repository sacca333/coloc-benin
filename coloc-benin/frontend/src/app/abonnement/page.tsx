'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useRequireAuth } from '../../hooks/useAuth';
import { abonnementsApi } from '../../lib/api';
import { Abonnement, OperateurPaiement } from '../../types';
import { Navbar } from '../../components/layout/Navbar';
import clsx from 'clsx';

const OPERATEURS = [
  {
    id: 'MOMO' as OperateurPaiement,
    nom: 'MTN MoMo',
    couleur: 'bg-yellow-50 border-yellow-200 text-yellow-800',
    actif: 'ring-2 ring-yellow-400',
    prefix: '96, 97',
  },
  {
    id: 'CCASH' as OperateurPaiement,
    nom: "C'cash (Celtiis)",
    couleur: 'bg-blue-50 border-blue-200 text-blue-800',
    actif: 'ring-2 ring-blue-400',
    prefix: '94, 95',
  },
  {
    id: 'MOOV_MONEY' as OperateurPaiement,
    nom: 'Moov Money',
    couleur: 'bg-green-50 border-green-200 text-green-800',
    actif: 'ring-2 ring-green-400',
    prefix: '99',
  },
];

const STATUT_LABELS: Record<string, string> = {
  ACTIF: 'Actif', EXPIRE: 'Expiré', EN_ATTENTE: 'En attente', ECHEC: 'Échoué',
};

export default function AbonnementPage() {
  const { user, isLoading } = useRequireAuth();
  const router = useRouter();
  const [operateur, setOperateur] = useState<OperateurPaiement>('MOMO');
  const [telephone, setTelephone] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [historique, setHistorique] = useState<Abonnement[]>([]);
  const [statut, setStatut] = useState<{ actif: boolean; periodeFin?: string } | null>(null);

  useEffect(() => {
    if (!user) return;
    abonnementsApi.statut().then(r => setStatut(r.data));
    abonnementsApi.historique().then(r => setHistorique(r.data));
  }, [user]);

  const handlePayer = async () => {
    if (!telephone.trim()) { setError('Entrez votre numéro de téléphone'); return; }
    setSubmitting(true); setError(''); setMessage('');
    try {
      const { data } = await abonnementsApi.initier(operateur, telephone);
      setMessage(`${data.message} — Confirmez le paiement de 300 FCFA sur votre téléphone.`);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Erreur lors du paiement');
    } finally {
      setSubmitting(false);
    }
  };

  if (isLoading) return <div className="min-h-screen flex items-center justify-center text-gray-400">Chargement...</div>;

  return (
    <>
      <Navbar />
      <main className="max-w-2xl mx-auto px-4 py-8">
        {/* Statut actuel */}
        <div className="card mb-6">
          <h2 className="font-semibold text-base mb-3">Statut de votre abonnement</h2>
          {statut?.actif ? (
            <div className="flex items-center gap-3">
              <span className="badge-actif text-sm px-3 py-1">Abonnement actif</span>
              {statut.periodeFin && (
                <span className="text-sm text-gray-500">
                  jusqu'au {new Date(statut.periodeFin).toLocaleDateString('fr-FR')}
                </span>
              )}
            </div>
          ) : (
            <p className="text-sm text-gray-500">Aucun abonnement actif — 300 FCFA / mois pour accéder à toutes les fonctionnalités.</p>
          )}
        </div>

        {/* Formulaire de paiement */}
        <div className="card mb-6">
          <h2 className="font-semibold text-base mb-4">
            {statut?.actif ? 'Renouveler mon abonnement' : 'Activer mon abonnement'}
          </h2>

          <p className="text-sm text-gray-500 mb-4">Choisissez votre opérateur mobile :</p>
          <div className="grid grid-cols-3 gap-3 mb-5">
            {OPERATEURS.map(op => (
              <button
                key={op.id}
                onClick={() => setOperateur(op.id)}
                className={clsx(
                  'border rounded-xl p-3 text-sm font-medium text-left transition-all',
                  op.couleur,
                  operateur === op.id && op.actif
                )}
              >
                <div className="font-semibold">{op.nom}</div>
                <div className="text-xs opacity-70 mt-0.5">Numéros {op.prefix}</div>
              </button>
            ))}
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Numéro de téléphone mobile money
            </label>
            <input
              type="tel"
              value={telephone}
              onChange={e => setTelephone(e.target.value)}
              className="input"
              placeholder="+229 97000000"
            />
          </div>

          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg mb-4">
            <span className="text-sm text-gray-600">Montant</span>
            <span className="font-semibold text-gray-900">300 FCFA</span>
          </div>

          {error && <p className="text-sm text-red-500 mb-3">{error}</p>}
          {message && (
            <div className="p-3 bg-teal-50 text-teal-700 text-sm rounded-lg border border-teal-100 mb-3">
              {message}
            </div>
          )}

          <button onClick={handlePayer} disabled={submitting} className="btn-primary w-full">
            {submitting ? 'Traitement...' : 'Payer 300 FCFA'}
          </button>
        </div>

        {/* Historique */}
        {historique.length > 0 && (
          <div className="card">
            <h2 className="font-semibold text-base mb-3">Historique des paiements</h2>
            <div className="space-y-2">
              {historique.map(ab => (
                <div key={ab.id} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                  <div>
                    <span className="text-sm font-medium">{ab.operateur.replace('_', ' ')}</span>
                    <span className="text-xs text-gray-400 ml-2">
                      {ab.datePaiement ? new Date(ab.datePaiement).toLocaleDateString('fr-FR') : '—'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm">{ab.montant} FCFA</span>
                    <span className={clsx(
                      'text-xs px-2 py-0.5 rounded-full font-medium',
                      ab.statut === 'ACTIF' ? 'badge-actif' :
                      ab.statut === 'ECHEC' ? 'badge-expire' : 'badge-attente'
                    )}>
                      {STATUT_LABELS[ab.statut]}
                    </span>
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
