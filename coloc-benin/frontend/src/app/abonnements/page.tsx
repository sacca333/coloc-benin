'use client';
import { useEffect, useState, useCallback } from 'react';
import { api } from '@/lib/api';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

const photoUrl = (p: string) => `${process.env.NEXT_PUBLIC_API_URL?.replace('/api', '')}${p}`;

const sC: Record<string, [string, string]> = {
  ACTIF: ['#10B981', 'rgba(16,185,129,.1)'],
  EXPIRE: ['#EF4444', 'rgba(239,68,68,.1)'],
  EN_ATTENTE: ['#F59E0B', 'rgba(245,158,11,.1)'],
  ECHEC: ['#6B7280', 'rgba(107,114,128,.1)'],
};

const opIcons: Record<string, string> = { MOMO: '📱', CCASH: '💳', MOOV_MONEY: '📲' };

function Skeleton({ w = '100%', h = 14, r = 4 }: any) {
  return <div style={{ width: w, height: h, borderRadius: r, background: 'linear-gradient(90deg,#0F1929 25%,#162035 50%,#0F1929 75%)', backgroundSize: '200% 100%', animation: 'shimmer 1.5s infinite' }} />;
}

function Toast({ msg, type, onClose }: any) {
  useEffect(() => { const t = setTimeout(onClose, 3000); return () => clearTimeout(t); }, []);
  return (
    <div style={{ position: 'fixed', bottom: 24, right: 24, zIndex: 9999, background: type === 'success' ? '#064E3B' : '#450A0A', border: `1px solid ${type === 'success' ? '#10B981' : '#EF4444'}`, borderRadius: 12, padding: '12px 18px', display: 'flex', alignItems: 'center', gap: 10, boxShadow: '0 8px 32px rgba(0,0,0,.5)', fontFamily: "'Syne',sans-serif", animation: 'slideUp .3s ease' }}>
      <span style={{ fontSize: 16 }}>{type === 'success' ? '✓' : '✕'}</span>
      <span style={{ fontSize: 13, color: '#F1F5F9' }}>{msg}</span>
    </div>
  );
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: '#0D1628', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, padding: '10px 14px', fontFamily: "'JetBrains Mono',monospace", fontSize: 12 }}>
      <div style={{ color: '#94A3B8', marginBottom: 4 }}>{label}</div>
      {payload.map((p: any) => <div key={p.name} style={{ color: p.color }}>{p.value?.toLocaleString('fr-FR')} F</div>)}
    </div>
  );
};

export default function AdminAbonnements() {
  const [data, setData] = useState<any>({ abonnements: [], total: 0, pages: 1 });
  const [page, setPage] = useState(1);
  const [statut, setStatut] = useState('');
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<string | null>(null);
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);
  const [revenusData, setRevenusData] = useState<any[]>([]);

  const showToast = (msg: string, type: 'success' | 'error' = 'success') => setToast({ msg, type });

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const r = await api.get('/admin/abonnements', { params: { page, limit: 20, statut } });
      setData(r.data);
    } catch { showToast('Erreur de chargement', 'error'); }
    finally { setLoading(false); }
  }, [page, statut]);

  // Charger stats pour mini-graphique
  useEffect(() => {
    api.get('/admin/stats').then(r => {
      if (r.data?.evolutionMois) setRevenusData(r.data.evolutionMois);
    }).catch(() => { });
  }, []);

  useEffect(() => { load(); }, [load]);

  const setStatutAbo = async (id: string, s: string) => {
    setBusy(id);
    try {
      await api.put(`/admin/abonnements/${id}/statut`, { statut: s });
      setData((d: any) => ({ ...d, abonnements: d.abonnements.map((a: any) => a.id === id ? { ...a, statut: s } : a) }));
      showToast(`Abonnement ${s.toLowerCase()}`);
    } catch { showToast('Erreur', 'error'); }
    finally { setBusy(null); }
  };

  const exportCSV = () => window.open(`${process.env.NEXT_PUBLIC_API_URL}/admin/abonnements/export`, '_blank');

  // Calculs financiers
  const revenusPage = data.abonnements.filter((a: any) => a.statut === 'ACTIF').reduce((s: number, a: any) => s + (a.montant || 0), 0);
  const totalAbos = data.total;
  const aboActifs = data.abonnements.filter((a: any) => a.statut === 'ACTIF').length;
  const expireBientot = data.abonnements.filter((a: any) => {
    if (a.statut !== 'ACTIF' || !a.periodeFin) return false;
    return Math.ceil((new Date(a.periodeFin).getTime() - Date.now()) / 86400000) <= 7;
  }).length;

  return (
    <div style={{ maxWidth: 1200, fontFamily: "'Syne',sans-serif" }}>
      <style>{`
        @keyframes shimmer{0%{background-position:-200% 0}100%{background-position:200% 0}}
        @keyframes slideUp{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}
      `}</style>
      {toast && <Toast msg={toast.msg} type={toast.type} onClose={() => setToast(null)} />}

      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ fontSize: 10, color: '#10B981', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: 6 }}>Administration</div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: 12 }}>
          <div>
            <h1 style={{ fontSize: 30, fontWeight: 800, color: '#F1F5F9', margin: 0, letterSpacing: '-1px' }}>Abonnements</h1>
            <p style={{ color: '#334155', margin: '4px 0 0', fontSize: 12 }}>Suivi des revenus et gestion des abonnements</p>
          </div>
          <button onClick={exportCSV}
            style={{ fontSize: 12, padding: '9px 18px', borderRadius: 10, border: '1px solid rgba(16,185,129,.3)', background: 'rgba(16,185,129,.08)', color: '#10B981', cursor: 'pointer', fontFamily: "'Syne',sans-serif", fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6, transition: 'all .2s' }}
            onMouseEnter={e => (e.currentTarget.style.background = 'rgba(16,185,129,.15)')}
            onMouseLeave={e => (e.currentTarget.style.background = 'rgba(16,185,129,.08)')}>
            ↓ Exporter CSV
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 14, marginBottom: 20 }}>
        {[
          { label: 'Total abonnements', val: totalAbos, color: '#3B82F6', icon: '📊' },
          { label: 'Actifs cette page', val: aboActifs, color: '#10B981', icon: '✅' },
          { label: 'Revenus (page)', val: revenusPage.toLocaleString('fr-FR') + ' F', color: '#F59E0B', icon: '💰' },
          { label: 'Expire dans 7j', val: expireBientot, color: expireBientot > 0 ? '#EF4444' : '#475569', icon: '⚠️' },
        ].map((k, i) => (
          <div key={i} style={{ background: '#080F1C', border: `1px solid ${k.color}20`, borderRadius: 14, padding: 18, position: 'relative', overflow: 'hidden', transition: 'transform .2s' }}
            onMouseEnter={e => (e.currentTarget.style.transform = 'translateY(-2px)')}
            onMouseLeave={e => (e.currentTarget.style.transform = 'translateY(0)')}>
            <div style={{ position: 'absolute', top: 0, right: 0, width: 80, height: 80, background: `radial-gradient(circle at 100% 0%,${k.color}20,transparent 70%)` }} />
            <div style={{ fontSize: 22, marginBottom: 8 }}>{k.icon}</div>
            <div style={{ fontSize: 9, color: '#475569', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: 4 }}>{k.label}</div>
            <div style={{ fontSize: 24, fontWeight: 800, color: k.color, fontFamily: "'JetBrains Mono',monospace" }}>{k.val}</div>
          </div>
        ))}
      </div>

      {/* Mini graphique revenus */}
      {revenusData.length > 0 && (
        <div style={{ background: '#080F1C', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 14, padding: '18px 20px', marginBottom: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <div>
              <div style={{ fontSize: 9, color: '#475569', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: 2 }}>Tendance</div>
              <div style={{ fontSize: 14, fontWeight: 700, color: '#F1F5F9' }}>Revenus sur 6 mois</div>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={70}>
            <AreaChart data={revenusData} margin={{ top: 0, right: 0, bottom: 0, left: -20 }}>
              <defs>
                <linearGradient id="gRev" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#F59E0B" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="mois" tick={{ fontSize: 9, fill: '#334155', textTransform: 'capitalize' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 9, fill: '#334155' }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="revenus" stroke="#F59E0B" strokeWidth={2} fill="url(#gRev)" name="Revenus" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Filtres pills */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 16, flexWrap: 'wrap', alignItems: 'center' }}>
        <button onClick={() => { setStatut(''); setPage(1); }}
          style={{ fontSize: 11, padding: '6px 14px', borderRadius: 20, border: '1px solid', borderColor: statut === '' ? '#10B981' : 'rgba(255,255,255,0.08)', background: statut === '' ? 'rgba(16,185,129,.12)' : 'transparent', color: statut === '' ? '#10B981' : '#475569', cursor: 'pointer', fontWeight: 600, transition: 'all .2s' }}>
          Tous ({data.total})
        </button>
        {Object.entries(sC).map(([s, [c, bg]]) => (
          <button key={s} onClick={() => { setStatut(s === statut ? '' : s); setPage(1); }}
            style={{ fontSize: 11, padding: '6px 14px', borderRadius: 20, border: '1px solid', borderColor: statut === s ? c : 'rgba(255,255,255,0.08)', background: statut === s ? bg : 'transparent', color: statut === s ? c : '#475569', cursor: 'pointer', fontWeight: 600, transition: 'all .2s' }}>
            {s}
          </button>
        ))}

        {/* Alerte expiration */}
        {expireBientot > 0 && (
          <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 8, background: 'rgba(239,68,68,.08)', border: '1px solid rgba(239,68,68,.2)', borderRadius: 20, padding: '6px 14px' }}>
            <span style={{ fontSize: 12 }}>⚠️</span>
            <span style={{ fontSize: 11, color: '#EF4444', fontWeight: 600 }}>{expireBientot} abonnement(s) expirent dans 7 jours</span>
          </div>
        )}
      </div>

      {/* Table */}
      <div style={{ background: '#080F1C', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 16, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.06)', background: 'rgba(255,255,255,0.02)' }}>
              {['Utilisateur', 'Opérateur', 'Montant', 'Période', 'Jours restants', 'Statut', 'Actions'].map(h => (
                <th key={h} style={{ padding: '12px 14px', textAlign: 'left', fontSize: 9, color: '#334155', letterSpacing: '1px', textTransform: 'uppercase', fontWeight: 600 }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? [...Array(8)].map((_, i) => (
              <tr key={i} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                <td style={{ padding: '12px 14px' }}>
                  <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                    <Skeleton w={34} h={34} r={17} />
                    <div style={{ flex: 1 }}><Skeleton w="70%" h={12} /><div style={{ marginTop: 5 }}><Skeleton w="50%" h={10} /></div></div>
                  </div>
                </td>
                {[...Array(6)].map((_, j) => <td key={j} style={{ padding: '12px 14px' }}><Skeleton w="60%" h={12} /></td>)}
              </tr>
            )) : data.abonnements.length === 0 ? (
              <tr><td colSpan={7} style={{ padding: '60px 20px', textAlign: 'center' }}>
                <div style={{ fontSize: 40, marginBottom: 12 }}>💳</div>
                <div style={{ fontSize: 14, color: '#475569' }}>Aucun abonnement trouvé</div>
              </td></tr>
            ) : data.abonnements.map((a: any) => {
              const [c, bg] = sC[a.statut] || sC.ECHEC;
              const fin = a.periodeFin ? new Date(a.periodeFin) : null;
              const jours = fin ? Math.ceil((fin.getTime() - Date.now()) / 86400000) : 0;
              const urgence = jours <= 3 ? '#EF4444' : jours <= 7 ? '#F59E0B' : '#10B981';

              return (
                <tr key={a.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', transition: 'background .15s' }}
                  onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.02)')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
                  <td style={{ padding: '10px 14px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      {a.utilisateur?.photo ? (
                        <img src={photoUrl(a.utilisateur.photo)} alt="" style={{ width: 36, height: 36, borderRadius: '50%', objectFit: 'cover', border: '2px solid rgba(16,185,129,.2)' }} />
                      ) : (
                        <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'linear-gradient(135deg,#10B981,#3B82F6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, color: '#fff', flexShrink: 0 }}>
                          {a.utilisateur?.prenom?.[0]}{a.utilisateur?.nom?.[0]}
                        </div>
                      )}
                      <div>
                        <div style={{ fontSize: 12, fontWeight: 600, color: '#E2E8F0' }}>{a.utilisateur?.prenom} {a.utilisateur?.nom}</div>
                        <div style={{ fontSize: 10, color: '#334155' }}>{a.utilisateur?.email}</div>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: '10px 14px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span>{opIcons[a.operateur] || '💳'}</span>
                      <span style={{ fontSize: 12, color: '#CBD5E1', fontWeight: 600 }}>{a.operateur}</span>
                    </div>
                  </td>
                  <td style={{ padding: '10px 14px' }}>
                    <div style={{ fontSize: 15, fontWeight: 800, color: '#F59E0B', fontFamily: "'JetBrains Mono',monospace" }}>{(a.montant || 0).toLocaleString()} F</div>
                  </td>
                  <td style={{ padding: '10px 14px' }}>
                    <div style={{ fontSize: 11, color: '#94A3B8' }}>
                      {a.periodeDebut ? new Date(a.periodeDebut).toLocaleDateString('fr-FR') : '—'}
                    </div>
                    <div style={{ fontSize: 11, color: '#475569' }}>
                      → {fin ? fin.toLocaleDateString('fr-FR') : '—'}
                    </div>
                  </td>
                  <td style={{ padding: '10px 14px' }}>
                    {a.statut === 'ACTIF' && fin ? (
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <div style={{ width: 6, height: 6, borderRadius: '50%', background: urgence }} />
                          <span style={{ fontSize: 12, fontWeight: 700, color: urgence, fontFamily: "'JetBrains Mono',monospace" }}>
                            {jours > 0 ? `${jours}j` : 'Expiré'}
                          </span>
                        </div>
                        {/* Barre de progression */}
                        <div style={{ height: 3, background: 'rgba(255,255,255,0.06)', borderRadius: 2, marginTop: 5, width: 60 }}>
                          <div style={{ height: '100%', width: `${Math.min(100, Math.max(0, (jours / 30) * 100))}%`, background: urgence, borderRadius: 2, transition: 'width .3s' }} />
                        </div>
                      </div>
                    ) : (
                      <span style={{ fontSize: 11, color: '#334155' }}>—</span>
                    )}
                  </td>
                  <td style={{ padding: '10px 14px' }}>
                    <span style={{ fontSize: 10, fontWeight: 700, color: c, background: bg, padding: '3px 10px', borderRadius: 20 }}>{a.statut}</span>
                  </td>
                  <td style={{ padding: '10px 14px' }}>
                    <div style={{ display: 'flex', gap: 5 }}>
                      {a.statut !== 'ACTIF' && (
                        <button onClick={() => setStatutAbo(a.id, 'ACTIF')} disabled={busy === a.id}
                          style={{ fontSize: 10, padding: '4px 10px', borderRadius: 7, border: '1px solid rgba(16,185,129,.25)', background: 'rgba(16,185,129,.06)', color: '#10B981', cursor: 'pointer', transition: 'all .15s' }}>
                          {busy === a.id ? '…' : 'Activer'}
                        </button>
                      )}
                      {a.statut === 'ACTIF' && (
                        <button onClick={() => setStatutAbo(a.id, 'EXPIRE')} disabled={busy === a.id}
                          style={{ fontSize: 10, padding: '4px 10px', borderRadius: 7, border: '1px solid rgba(239,68,68,.25)', background: 'rgba(239,68,68,.06)', color: '#EF4444', cursor: 'pointer', transition: 'all .15s' }}>
                          {busy === a.id ? '…' : 'Expirer'}
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {/* Footer pagination */}
        {!loading && data.abonnements.length > 0 && (
          <div style={{ padding: '12px 16px', borderTop: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 11, color: '#334155' }}>
              Page {page} sur {data.pages} · {data.total} abonnements
            </span>
            <div style={{ display: 'flex', gap: 4 }}>
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                style={{ padding: '4px 10px', borderRadius: 6, border: '1px solid rgba(255,255,255,0.08)', background: 'transparent', color: page === 1 ? '#1E293B' : '#475569', cursor: page === 1 ? 'default' : 'pointer', fontSize: 12 }}>←</button>
              {Array.from({ length: Math.min(data.pages, 5) }, (_, i) => {
                const p = Math.max(1, Math.min(page - 2, data.pages - 4)) + i;
                return (
                  <button key={p} onClick={() => setPage(p)}
                    style={{ width: 30, height: 30, borderRadius: 6, border: '1px solid', borderColor: p === page ? '#10B981' : 'rgba(255,255,255,0.08)', background: p === page ? 'rgba(16,185,129,.15)' : 'transparent', color: p === page ? '#10B981' : '#475569', cursor: 'pointer', fontSize: 12, fontFamily: "'JetBrains Mono',monospace" }}>{p}</button>
                );
              })}
              <button onClick={() => setPage(p => Math.min(data.pages, p + 1))} disabled={page === data.pages}
                style={{ padding: '4px 10px', borderRadius: 6, border: '1px solid rgba(255,255,255,0.08)', background: 'transparent', color: page === data.pages ? '#1E293B' : '#475569', cursor: page === data.pages ? 'default' : 'pointer', fontSize: 12 }}>→</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}