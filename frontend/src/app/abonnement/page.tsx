'use client';
import { useState, useEffect } from 'react';
import { useRequireAuth } from '../../hooks/useAuth';
import { abonnementsApi } from '../../lib/api';
import { Abonnement } from '../../types';
import { Navbar } from '../../components/layout/Navbar';

const KKIAPAY_PUBLIC_KEY = '4bb03f5045cd11f1aeef5d6fe67ac015';
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

  // Charger script KKiaPay
  useEffect(() => {
    if (document.getElementById('kkiapay-script')) { setScriptLoaded(true); return; }
    const script = document.createElement('script');
    script.id = 'kkiapay-script';
    script.src = 'https://cdn.kkiapay.me/k.js';
    script.async = true;
    script.onload = () => { console.log('[KKiaPay] Script chargé'); setScriptLoaded(true); };
    script.onerror = () => console.error('[KKiaPay] Erreur chargement script');
    document.body.appendChild(script);
  }, []);

  // Charger données utilisateur
  useEffect(() => {
    if (!user) return;
    abonnementsApi.statut().then(r => setStatut(r.data)).catch(() => { });
    abonnementsApi.historique().then(r => setHistorique(r.data)).catch(() => { });
  }, [user]);

  // Écouter les messages postMessage de KKiaPay
  useEffect(() => {
    const handleMessage = async (event: MessageEvent) => {
      console.log('[KKiaPay postMessage]', event.origin, JSON.stringify(event.data));

      // KKiaPay envoie les événements via postMessage
      const data = event.data;
      if (!data) return;

      // Succès
      if (data.name === 'PAYMENT_SUCCESS' && data.data?.transactionId) {
        console.log('[KKiaPay] Paiement réussi détecté:', JSON.stringify(data));
        const transactionId = data.data.transactionId;
        if (!transactionId) { console.error('[KKiaPay] Pas de transactionId'); return; }
        setPaying(true);
        setError('');
        try {
          await abonnementsApi.confirmerKkiapay(transactionId);
          setMessage('Paiement confirme ! Votre abonnement est maintenant actif.');
          const [s, h] = await Promise.all([abonnementsApi.statut(), abonnementsApi.historique()]);
          setStatut(s.data);
          setHistorique(h.data);
        } catch (err: any) {
          console.error('[KKiaPay] Erreur confirmation:', err);
          setError('Paiement recu mais confirmation echouee : ' + (err?.response?.data?.error || err?.message));
        } finally { setPaying(false); }
      }

      // Échec
      if (data.name === 'PAYMENT_FAILED' || data.name === 'PAYMENT_CANCELLED') {
        console.log('[KKiaPay] Paiement échoué:', JSON.stringify(data));
        setError('Le paiement a echoue. Reessayez.');
        setPaying(false);
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  // Aussi essayer les listeners KKiaPay classiques
  useEffect(() => {
    if (!scriptLoaded) return;

    const onSuccess = async (data: any) => {
      console.log('[KKiaPay addListener success]', JSON.stringify(data));
      const transactionId = data.transactionId || data.transaction_id || data.id;
      if (!transactionId) return;
      setPaying(true);
      setError('');
      try {
        await abonnementsApi.confirmerKkiapay(transactionId);
        setMessage('Paiement confirme ! Votre abonnement est maintenant actif.');
        const [s, h] = await Promise.all([abonnementsApi.statut(), abonnementsApi.historique()]);
        setStatut(s.data);
        setHistorique(h.data);
      } catch (err: any) {
        setError('Confirmation echouee : ' + (err?.response?.data?.error || err?.message));
      } finally { setPaying(false); }
    };

    const onFailed = (data: any) => {
      console.log('[KKiaPay addListener failed]', JSON.stringify(data));
      setError('Le paiement a echoue. Reessayez.');
      setPaying(false);
    };

    (window as any).addKkiapayListener?.('success', onSuccess);
    (window as any).addKkiapayListener?.('failed', onFailed);

    return () => {
      (window as any).removeKkiapayListener?.('success', onSuccess);
      (window as any).removeKkiapayListener?.('failed', onFailed);
    };
  }, [scriptLoaded]);

  const ouvrirWidget = () => {
    if (!scriptLoaded || !(window as any).openKkiapayWidget) {
      setError('Module de paiement en cours de chargement. Reessayez.');
      return;
    }
    setError('');
    setMessage('');
    console.log('[KKiaPay] Ouverture widget...');
    (window as any).openKkiapayWidget({
      amount: MONTANT,
      api_key: KKIAPAY_PUBLIC_KEY,
      sandbox: true,
      name: (user?.prenom || '') + ' ' + (user?.nom || ''),
      email: user?.email || '',
      phone: '',
      reason: 'Abonnement mensuel ColocBenin',
      theme: '#0284c7',
    });
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
            {[{ label: 'MTN MoMo', color: '#f59e0b', bg: '#fef3c7' }, { label: "C'Cash", color: '#3b82f6', bg: '#dbeafe' }, { label: 'Moov Money', color: '#16a34a', bg: '#d1fae5' }, { label: 'Carte bancaire', color: '#7c3aed', bg: '#ede9fe' }].map((op, i) => (
              <span key={i} style={{ fontSize: 11, fontWeight: 600, color: op.color, background: op.bg, padding: '3px 10px', borderRadius: 20 }}>{op.label}</span>
            ))}
          </div>

          {error && <div style={{ padding: '10px 14px', background: '#fee2e2', borderRadius: 10, fontSize: 13, color: '#991b1b', marginBottom: 12 }}>{error}</div>}
          {message && <div style={{ padding: '10px 14px', background: '#d1fae5', borderRadius: 10, fontSize: 13, color: '#065f46', marginBottom: 12 }}>{message}</div>}

          <button onClick={ouvrirWidget} disabled={paying || !scriptLoaded}
            style={{ width: '100%', padding: '14px', borderRadius: 12, border: 'none', background: paying || !scriptLoaded ? '#94a3b8' : '#0284c7', color: '#fff', fontSize: 15, fontWeight: 700, cursor: paying || !scriptLoaded ? 'default' : 'pointer', fontFamily: "'Syne',sans-serif", display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
            {paying ? (
              <><div style={{ width: 18, height: 18, border: '2px solid #fff', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin .7s linear infinite' }} />Confirmation...</>
            ) : !scriptLoaded ? 'Chargement...' : 'Payer 300 FCFA avec KKiaPay'}
          </button>
          <div style={{ fontSize: 11, color: '#94a3b8', textAlign: 'center', marginTop: 10 }}>Paiement securise par KKiaPay</div>
        </div>

        {historique.length > 0 && (
          <div style={{ background: '#fff', border: '1px solid #e0f2fe', borderRadius: 16, padding: 24, boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
            <div style={{ fontSize: 10, color: '#0284c7', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: 16, fontWeight: 700 }}>Historique</div>
            {historique.map((ab, i) => (
              <div key={ab.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 0', borderBottom: i < historique.length - 1 ? '1px solid #f0f9ff' : 'none' }}>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: '#0c4a6e' }}>{ab.operateur?.replace('_', ' ') || 'KKiaPay'}</div>
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