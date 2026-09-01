'use client';
import { useState, useEffect } from 'react';
import { useRequireAuth } from '../../hooks/useAuth';
import { abonnementsApi } from '../../lib/api';
import { Abonnement } from '../../types';
import { Navbar } from '../../components/layout/Navbar';

const FEDAPAY_PUBLIC_KEY = process.env.NEXT_PUBLIC_FEDAPAY_PUBLIC_KEY || '';
const FEDAPAY_ENVIRONMENT = process.env.NEXT_PUBLIC_FEDAPAY_ENVIRONMENT || 'sandbox';
const MONTANT = 300;

const STATUT_LABELS: Record<string, string> = {
  ACTIF: 'Actif', EXPIRE: 'Expire', EN_ATTENTE: 'En attente', ECHEC: 'Echoue',
};

export default function AbonnementPage() {
  const { user, isLoading } = useRequireAuth();
  const [historique, setHistorique] = useState<Abonnement[]>([]);
  const [statut, setStatut] = useState<{ actif: boolean; periodeFin?: string } | null>(null);
  const [paying, setPaying] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [scriptLoaded, setScriptLoaded] = useState(false);

  // Charger script FedaPay checkout.js
  useEffect(() => {
    if (document.getElementById('fedapay-script')) { setScriptLoaded(true); return; }
    const script = document.createElement('script');
    script.id = 'fedapay-script';
    script.src = 'https://cdn.fedapay.com/checkout.js?v=1.1.7';
    script.async = true;
    script.onload = () => { console.log('[FedaPay] Script chargé'); setScriptLoaded(true); };
    script.onerror = () => console.error('[FedaPay] Erreur chargement script');
    document.body.appendChild(script);
  }, []);

  // Charger données utilisateur
  useEffect(() => {
    if (!user) return;
    abonnementsApi.statut().then(r => setStatut(r.data)).catch(() => { });
    abonnementsApi.historique().then(r => setHistorique(r.data)).catch(() => { });
  }, [user]);

  const ouvrirWidget = () => {
    const FedaPay = (window as any).FedaPay;
    if (!scriptLoaded || !FedaPay) {
      setError('Module de paiement en cours de chargement. Reessayez.');
      return;
    }
    if (!FEDAPAY_PUBLIC_KEY) {
      setError('Configuration de paiement manquante. Contactez le support.');
      return;
    }
    setError('');
    setMessage('');
    console.log('[FedaPay] Ouverture widget...');

    const widget = FedaPay.init({
      public_key: FEDAPAY_PUBLIC_KEY,
      environment: FEDAPAY_ENVIRONMENT,
      locale: 'fr',
      transaction: {
        amount: MONTANT,
        description: 'Abonnement mensuel ColocBenin',
      },
      currency: { iso: 'XOF' },
      customer: {
        email: user?.email || '',
        firstname: user?.prenom || '',
        lastname: user?.nom || '',
      },
      onComplete: async ({ reason, transaction }: any) => {
        if (reason !== FedaPay.CHECKOUT_COMPLETED || transaction?.status !== 'approved') {
          console.log('[FedaPay] Paiement non finalise:', reason, transaction?.status);
          setError('Le paiement a echoue ou a ete annule.');
          return;
        }
        setPaying(true);
        setError('');
        try {
          await abonnementsApi.confirmerFedapay(transaction.id);
          setMessage('Paiement confirme ! Votre abonnement est maintenant actif.');
          const [s, h] = await Promise.all([abonnementsApi.statut(), abonnementsApi.historique()]);
          setStatut(s.data);
          setHistorique(h.data);
        } catch (err: any) {
          console.error('[FedaPay] Erreur confirmation:', err);
          setError('Paiement recu mais confirmation echouee : ' + (err?.response?.data?.error || err?.message));
        } finally { setPaying(false); }
      },
    });

    widget.open();
  };

  if (isLoading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div style={{ width: 32, height: 32, border: '3px solid #0284c7', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin .8s linear infinite' }} />
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );

  const finDate = statut?.periodeFin ? new Date(statut.periodeFin) : null;

  return (
    <>
      <Navbar />
      <main className="max-w-2xl mx-auto px-4 py-8" style={{ fontFamily: "'Syne',sans-serif" }}>
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>

        <div style={{ background: '#fff', border: '1px solid #e0f2fe', borderRadius: 16, padding: 24, marginBottom: 16, boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
          <div style={{ fontSize: 10, color: '#0284c7', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: 8, fontWeight: 700 }}>Statut abonnement</div>
          {statut?.actif ? (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                <span style={{ fontSize: 22 }}>✅</span>
                <span style={{ fontSize: 16, fontWeight: 700, color: '#065f46' }}>Abonnement actif</span>
              </div>
              {finDate && (
                <div style={{ fontSize: 13, color: '#64748b' }}>
                  Valable jusqu'au <strong style={{ color: '#0c4a6e' }}>{finDate.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}</strong>
                </div>
              )}
            </div>
          ) : (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                <span style={{ fontSize: 22 }}>🔒</span>
                <span style={{ fontSize: 16, fontWeight: 700, color: '#991b1b' }}>Aucun abonnement actif</span>
              </div>
              <div style={{ fontSize: 13, color: '#64748b' }}>Abonnez-vous — <strong>300 FCFA / mois</strong></div>
            </div>
          )}
        </div>

        <div style={{ background: '#fff', border: '1px solid #e0f2fe', borderRadius: 16, padding: 24, marginBottom: 16, boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
          <div style={{ fontSize: 10, color: '#0284c7', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: 12, fontWeight: 700 }}>
            {statut?.actif ? 'Renouveler' : 'Activer mon abonnement'}
          </div>

          <div style={{ marginBottom: 20 }}>
            {['Contacter les proprietaires via la messagerie', 'Messagerie illimitee', 'Gestion de vos colocations', 'Support prioritaire'].map((f, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '5px 0', fontSize: 13, color: '#475569' }}>
                <span style={{ color: '#16a34a', fontWeight: 700 }}>✓</span> {f}
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', background: '#f0f9ff', borderRadius: 12, marginBottom: 16 }}>
            <div>
              <div style={{ fontSize: 13, color: '#64748b' }}>Abonnement mensuel</div>
              <div style={{ fontSize: 11, color: '#94a3b8' }}>Renouvelable chaque mois</div>
            </div>
            <div style={{ fontSize: 26, fontWeight: 800, color: '#0284c7', fontFamily: 'monospace' }}>300 FCFA</div>
          </div>

          <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
            {[{ label: 'MTN MoMo', color: '#f59e0b', bg: '#fef3c7' }, { label: 'Moov Money', color: '#16a34a', bg: '#d1fae5' }, { label: 'Carte bancaire', color: '#7c3aed', bg: '#ede9fe' }].map((op, i) => (
              <span key={i} style={{ fontSize: 11, fontWeight: 600, color: op.color, background: op.bg, padding: '3px 10px', borderRadius: 20 }}>{op.label}</span>
            ))}
          </div>

          {error && <div style={{ padding: '10px 14px', background: '#fee2e2', borderRadius: 10, fontSize: 13, color: '#991b1b', marginBottom: 12 }}>{error}</div>}
          {message && <div style={{ padding: '10px 14px', background: '#d1fae5', borderRadius: 10, fontSize: 13, color: '#065f46', marginBottom: 12 }}>{message}</div>}

          <button onClick={ouvrirWidget} disabled={paying || !scriptLoaded}
            style={{ width: '100%', padding: '14px', borderRadius: 12, border: 'none', background: paying || !scriptLoaded ? '#94a3b8' : '#0284c7', color: '#fff', fontSize: 15, fontWeight: 700, cursor: paying || !scriptLoaded ? 'default' : 'pointer', fontFamily: "'Syne',sans-serif", display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
            {paying ? (
              <><div style={{ width: 18, height: 18, border: '2px solid #fff', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin .7s linear infinite' }} />Confirmation...</>
            ) : !scriptLoaded ? 'Chargement...' : 'Payer 300 FCFA avec FedaPay'}
          </button>
          <div style={{ fontSize: 11, color: '#94a3b8', textAlign: 'center', marginTop: 10 }}>Paiement securise par FedaPay</div>
        </div>

        {historique.length > 0 && (
          <div style={{ background: '#fff', border: '1px solid #e0f2fe', borderRadius: 16, padding: 24, boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
            <div style={{ fontSize: 10, color: '#0284c7', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: 16, fontWeight: 700 }}>Historique</div>
            {historique.map((ab, i) => (
              <div key={ab.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 0', borderBottom: i < historique.length - 1 ? '1px solid #f0f9ff' : 'none' }}>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: '#0c4a6e' }}>{ab.operateur?.replace('_', ' ') || 'FedaPay'}</div>
                  <div style={{ fontSize: 11, color: '#94a3b8' }}>{ab.datePaiement ? new Date(ab.datePaiement).toLocaleDateString('fr-FR') : '-'}</div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ fontSize: 13, fontWeight: 700, color: '#0284c7', fontFamily: 'monospace' }}>{ab.montant} F</span>
                  <span style={{ fontSize: 10, fontWeight: 600, padding: '2px 9px', borderRadius: 20, color: ab.statut === 'ACTIF' ? '#065f46' : ab.statut === 'ECHEC' ? '#991b1b' : '#92400e', background: ab.statut === 'ACTIF' ? '#d1fae5' : ab.statut === 'ECHEC' ? '#fee2e2' : '#fef3c7' }}>{STATUT_LABELS[ab.statut] || ab.statut}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </>
  );
}