'use client';
import { useEffect, useState, useCallback } from 'react';
import { api } from '@/lib/api';

const photoUrl = (p: string) => `${process.env.NEXT_PUBLIC_API_URL?.replace('/api', '')}${p}`;

const sColors: Record<string, [string, string]> = {
  ACTIVE: ['#10B981', 'rgba(16,185,129,.1)'],
  COMPLET: ['#3B82F6', 'rgba(59,130,246,.1)'],
  INACTIVE: ['#F59E0B', 'rgba(245,158,11,.1)'],
  MODEREE: ['#8B5CF6', 'rgba(139,92,246,.1)'],
  SUPPRIMEE: ['#EF4444', 'rgba(239,68,68,.1)'],
};

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

function StatBadge({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div style={{ background: '#080F1C', border: `1px solid ${color}25`, borderRadius: 12, padding: '14px 18px', textAlign: 'center', minWidth: 100 }}>
      <div style={{ fontSize: 22, fontWeight: 800, color, fontFamily: "'JetBrains Mono',monospace" }}>{value}</div>
      <div style={{ fontSize: 10, color: '#475569', marginTop: 4, textTransform: 'uppercase', letterSpacing: '1px' }}>{label}</div>
    </div>
  );
}

export default function AdminAnnonces() {
  const [data, setData] = useState<any>({ annonces: [], total: 0, pages: 1 });
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [statut, setStatut] = useState('');
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<string | null>(null);
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);
  const [view, setView] = useState<'table' | 'grid'>('table');

  const showToast = (msg: string, type: 'success' | 'error' = 'success') => setToast({ msg, type });

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const r = await api.get('/admin/annonces', { params: { page, limit: 20, search, statut } });
      setData(r.data);
    } catch { showToast('Erreur de chargement', 'error'); }
    finally { setLoading(false); }
  }, [page, search, statut]);

  useEffect(() => { load(); }, [load]);

  const setAnnonceStatut = async (id: string, s: string) => {
    setBusy(id);
    try {
      await api.put(`/admin/annonces/${id}/statut`, { statut: s });
      setData((d: any) => ({ ...d, annonces: d.annonces.map((a: any) => a.id === id ? { ...a, statut: s } : a) }));
      showToast(`Statut mis à jour : ${s}`);
    } catch { showToast('Erreur', 'error'); }
    finally { setBusy(null); }
  };

  // Stats rapides à partir des données chargées
  const statsLocal = Object.keys(sColors).map(s => ({
    s, count: data.annonces.filter((a: any) => a.statut === s).length
  }));

  return (
    <div style={{ maxWidth: 1200, fontFamily: "'Syne',sans-serif" }}>
      <style>{`
        @keyframes shimmer{0%{background-position:-200% 0}100%{background-position:200% 0}}
        @keyframes slideUp{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}
        .ann-card:hover{border-color:rgba(16,185,129,.25)!important;transform:translateY(-2px)}
      `}</style>
      {toast && <Toast msg={toast.msg} type={toast.type} onClose={() => setToast(null)} />}

      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ fontSize: 10, color: '#10B981', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: 6 }}>Administration</div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: 12 }}>
          <div>
            <h1 style={{ fontSize: 30, fontWeight: 800, color: '#F1F5F9', margin: 0, letterSpacing: '-1px' }}>Annonces</h1>
            <p style={{ color: '#334155', margin: '4px 0 0', fontSize: 12 }}>Modérer et gérer les annonces de la plateforme</p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {/* Toggle vue */}
            <div style={{ display: 'flex', background: '#080F1C', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 10, overflow: 'hidden' }}>
              {(['table', 'grid'] as const).map(v => (
                <button key={v} onClick={() => setView(v)}
                  style={{ padding: '7px 14px', border: 'none', background: view === v ? 'rgba(16,185,129,.15)' : 'transparent', color: view === v ? '#10B981' : '#475569', cursor: 'pointer', fontSize: 14, transition: 'all .2s' }}>
                  {v === 'table' ? '☰' : '⊞'}
                </button>
              ))}
            </div>
            <span style={{ fontSize: 12, color: '#475569', fontFamily: "'JetBrains Mono',monospace", background: 'rgba(255,255,255,0.04)', padding: '6px 14px', borderRadius: 20 }}>
              {data.total} annonces
            </span>
          </div>
        </div>
      </div>

      {/* Stats rapides */}
      {!loading && (
        <div style={{ display: 'flex', gap: 10, marginBottom: 20, flexWrap: 'wrap' }}>
          {Object.entries(sColors).map(([s, [c]]) => (
            <StatBadge key={s} label={s} value={data.annonces.filter((a: any) => a.statut === s).length} color={c} />
          ))}
        </div>
      )}

      {/* Filtres */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 20, flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: 200 }}>
          <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#334155', fontSize: 14 }}>🔍</span>
          <input value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} placeholder="Rechercher ville, description..."
            style={{ width: '100%', background: '#080F1C', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 10, padding: '9px 14px 9px 36px', color: '#F1F5F9', fontSize: 13, outline: 'none', fontFamily: "'Syne',sans-serif", boxSizing: 'border-box', transition: 'border-color .2s' }}
            onFocus={e => (e.target.style.borderColor = 'rgba(16,185,129,.4)')}
            onBlur={e => (e.target.style.borderColor = 'rgba(255,255,255,0.08)')} />
        </div>

        {/* Filtres statut pills */}
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          <button onClick={() => { setStatut(''); setPage(1); }}
            style={{ fontSize: 11, padding: '6px 14px', borderRadius: 20, border: '1px solid', borderColor: statut === '' ? '#10B981' : 'rgba(255,255,255,0.08)', background: statut === '' ? 'rgba(16,185,129,.12)' : 'transparent', color: statut === '' ? '#10B981' : '#475569', cursor: 'pointer', fontWeight: 600, transition: 'all .2s' }}>
            Tous
          </button>
          {Object.entries(sColors).map(([s, [c, bg]]) => (
            <button key={s} onClick={() => { setStatut(s === statut ? '' : s); setPage(1); }}
              style={{ fontSize: 11, padding: '6px 14px', borderRadius: 20, border: '1px solid', borderColor: statut === s ? c : 'rgba(255,255,255,0.08)', background: statut === s ? bg : 'transparent', color: statut === s ? c : '#475569', cursor: 'pointer', fontWeight: 600, transition: 'all .2s' }}>
              {s}
            </button>
          ))}
        </div>

        {(search || statut) && (
          <button onClick={() => { setSearch(''); setStatut(''); setPage(1); }}
            style={{ background: 'rgba(239,68,68,.08)', border: '1px solid rgba(239,68,68,.2)', borderRadius: 10, padding: '9px 14px', color: '#EF4444', fontSize: 12, cursor: 'pointer', fontFamily: "'Syne',sans-serif", whiteSpace: 'nowrap' }}>
            ✕ Reset
          </button>
        )}
      </div>

      {/* Vue Grille */}
      {view === 'grid' ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(280px,1fr))', gap: 14, marginBottom: 20 }}>
          {loading ? [...Array(6)].map((_, i) => (
            <div key={i} style={{ background: '#080F1C', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 14, overflow: 'hidden' }}>
              <Skeleton w="100%" h={140} r={0} />
              <div style={{ padding: 14 }}>
                <Skeleton w="70%" h={14} /><div style={{ marginTop: 8 }}><Skeleton w="50%" h={11} /></div>
              </div>
            </div>
          )) : data.annonces.map((a: any) => {
            const [c, bg] = sColors[a.statut] || sColors.INACTIVE;
            return (
              <div key={a.id} className="ann-card" style={{ background: '#080F1C', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 14, overflow: 'hidden', transition: 'all .2s' }}>
                <div style={{ height: 120, background: 'rgba(59,130,246,.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
                  {a.photos?.[0] ? <img src={photoUrl(a.photos[0])} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <span style={{ fontSize: 40 }}>🏘️</span>}
                  <span style={{ position: 'absolute', top: 10, right: 10, fontSize: 10, fontWeight: 700, color: c, background: bg, padding: '3px 9px', borderRadius: 20, backdropFilter: 'blur(8px)' }}>{a.statut}</span>
                </div>
                <div style={{ padding: 14 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: '#E2E8F0', marginBottom: 4 }}>{a.ville}{a.quartier ? `, ${a.quartier}` : ''}</div>
                  <div style={{ fontSize: 11, color: '#334155', marginBottom: 10 }}>{a.proprietaire?.prenom} {a.proprietaire?.nom}</div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: 14, fontWeight: 800, color: '#F59E0B', fontFamily: "'JetBrains Mono',monospace" }}>{(a.loyerTotal || 0).toLocaleString()} F</span>
                    <div style={{ display: 'flex', gap: 5 }}>
                      {a.statut !== 'ACTIVE' && a.statut !== 'SUPPRIMEE' && (
                        <button onClick={() => setAnnonceStatut(a.id, 'ACTIVE')} style={{ fontSize: 10, padding: '3px 8px', borderRadius: 6, border: '1px solid rgba(16,185,129,.3)', background: 'transparent', color: '#10B981', cursor: 'pointer' }}>Activer</button>
                      )}
                      {a.statut === 'ACTIVE' && (
                        <button onClick={() => setAnnonceStatut(a.id, 'MODEREE')} style={{ fontSize: 10, padding: '3px 8px', borderRadius: 6, border: '1px solid rgba(139,92,246,.3)', background: 'transparent', color: '#8B5CF6', cursor: 'pointer' }}>Modérer</button>
                      )}
                      {a.statut !== 'SUPPRIMEE' && (
                        <button onClick={() => setAnnonceStatut(a.id, 'SUPPRIMEE')} style={{ fontSize: 10, padding: '3px 8px', borderRadius: 6, border: '1px solid rgba(239,68,68,.3)', background: 'transparent', color: '#EF4444', cursor: 'pointer' }}>✕</button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Vue Table */
        <div style={{ background: '#080F1C', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 16, overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.06)', background: 'rgba(255,255,255,0.02)' }}>
                {['Annonce', 'Propriétaire', 'Type', 'Prix/mois', 'Places', 'Statut', 'Actions'].map(h => (
                  <th key={h} style={{ padding: '12px 14px', textAlign: 'left', fontSize: 9, color: '#334155', letterSpacing: '1px', textTransform: 'uppercase', fontWeight: 600 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? [...Array(8)].map((_, i) => (
                <tr key={i} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                  <td style={{ padding: '12px 14px' }}>
                    <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                      <Skeleton w={40} h={40} r={8} />
                      <div style={{ flex: 1 }}><Skeleton w="70%" h={12} /><div style={{ marginTop: 5 }}><Skeleton w="50%" h={10} /></div></div>
                    </div>
                  </td>
                  {[...Array(6)].map((_, j) => <td key={j} style={{ padding: '12px 14px' }}><Skeleton w="60%" h={12} /></td>)}
                </tr>
              )) : data.annonces.length === 0 ? (
                <tr><td colSpan={7} style={{ padding: '60px 20px', textAlign: 'center' }}>
                  <div style={{ fontSize: 40, marginBottom: 12 }}>📋</div>
                  <div style={{ fontSize: 14, color: '#475569' }}>Aucune annonce trouvée</div>
                </td></tr>
              ) : data.annonces.map((a: any) => {
                const [c, bg] = sColors[a.statut] || sColors.INACTIVE;
                return (
                  <tr key={a.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', transition: 'background .15s' }}
                    onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.02)')}
                    onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
                    <td style={{ padding: '10px 14px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{ width: 42, height: 42, borderRadius: 10, overflow: 'hidden', flexShrink: 0, background: 'rgba(59,130,246,.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          {a.photos?.[0] ? <img src={photoUrl(a.photos[0])} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <span style={{ fontSize: 20 }}>🏘️</span>}
                        </div>
                        <div>
                          <div style={{ fontSize: 12, fontWeight: 600, color: '#E2E8F0' }}>{a.ville}{a.quartier ? `, ${a.quartier}` : ''}</div>
                          <div style={{ fontSize: 10, color: '#334155' }}>{a.adresse || 'Adresse non précisée'}</div>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '10px 14px' }}>
                      <div style={{ fontSize: 12, color: '#CBD5E1' }}>{a.proprietaire?.prenom} {a.proprietaire?.nom}</div>
                      <div style={{ fontSize: 10, color: '#334155' }}>{a.proprietaire?.email}</div>
                    </td>
                    <td style={{ padding: '10px 14px' }}>
                      <span style={{ fontSize: 10, color: a.type === 'LOGEMENT_DISPONIBLE' ? '#06B6D4' : '#8B5CF6', background: a.type === 'LOGEMENT_DISPONIBLE' ? 'rgba(6,182,212,.1)' : 'rgba(139,92,246,.1)', padding: '3px 9px', borderRadius: 6, fontWeight: 600 }}>
                        {a.type === 'LOGEMENT_DISPONIBLE' ? 'Logement' : 'Colocation'}
                      </span>
                    </td>
                    <td style={{ padding: '10px 14px', fontSize: 13, fontWeight: 700, color: '#F59E0B', fontFamily: "'JetBrains Mono',monospace" }}>
                      {(a.loyerTotal || 0).toLocaleString()} F
                    </td>
                    <td style={{ padding: '10px 14px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        <span style={{ fontSize: 13, fontWeight: 700, color: '#F1F5F9', fontFamily: "'JetBrains Mono',monospace" }}>{a.placesRestantes ?? a.nbPlaces}</span>
                        <span style={{ fontSize: 10, color: '#334155' }}>/ {a.nbPlaces}</span>
                      </div>
                    </td>
                    <td style={{ padding: '10px 14px' }}>
                      <span style={{ fontSize: 10, fontWeight: 700, color: c, background: bg, padding: '3px 10px', borderRadius: 20 }}>{a.statut}</span>
                    </td>
                    <td style={{ padding: '10px 14px' }}>
                      <div style={{ display: 'flex', gap: 5 }}>
                        {a.statut !== 'ACTIVE' && a.statut !== 'SUPPRIMEE' && (
                          <button onClick={() => setAnnonceStatut(a.id, 'ACTIVE')} disabled={busy === a.id}
                            style={{ fontSize: 10, padding: '4px 10px', borderRadius: 7, border: '1px solid rgba(16,185,129,.25)', background: 'rgba(16,185,129,.06)', color: '#10B981', cursor: 'pointer', transition: 'all .15s' }}>
                            Activer
                          </button>
                        )}
                        {a.statut === 'ACTIVE' && (
                          <button onClick={() => setAnnonceStatut(a.id, 'MODEREE')} disabled={busy === a.id}
                            style={{ fontSize: 10, padding: '4px 10px', borderRadius: 7, border: '1px solid rgba(139,92,246,.25)', background: 'rgba(139,92,246,.06)', color: '#8B5CF6', cursor: 'pointer', transition: 'all .15s' }}>
                            {busy === a.id ? '…' : 'Modérer'}
                          </button>
                        )}
                        {a.statut !== 'SUPPRIMEE' && (
                          <button onClick={() => setAnnonceStatut(a.id, 'SUPPRIMEE')} disabled={busy === a.id}
                            style={{ fontSize: 10, padding: '4px 10px', borderRadius: 7, border: '1px solid rgba(239,68,68,.25)', background: 'rgba(239,68,68,.06)', color: '#EF4444', cursor: 'pointer', transition: 'all .15s' }}>
                            {busy === a.id ? '…' : '✕'}
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {/* Pagination footer */}
          {!loading && data.annonces.length > 0 && (
            <div style={{ padding: '12px 16px', borderTop: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: 11, color: '#334155' }}>
                Page {page} sur {data.pages} · {data.total} annonces
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
      )}
    </div>
  );
}