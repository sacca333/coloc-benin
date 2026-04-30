'use client';
import { useEffect, useState, useCallback } from 'react';
import { api, photoUrl } from '@/lib/api';

const sColors: Record<string, [string, string]> = {
  ACTIVE: ['#10B981', 'rgba(16,185,129,.1)'],
  COMPLET: ['#3B82F6', 'rgba(59,130,246,.1)'],
  INACTIVE: ['#F59E0B', 'rgba(245,158,11,.1)'],
  MODEREE: ['#8B5CF6', 'rgba(139,92,246,.1)'],
  SUPPRIMEE: ['#EF4444', 'rgba(239,68,68,.1)'],
};

export default function AdminAnnonces() {
  const [data, setData] = useState<any>({ annonces: [], total: 0, pages: 1 });
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [statut, setStatut] = useState('');
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try { const r = await api.get('/admin/annonces', { params: { page, limit: 20, search, statut } }); setData(r.data); }
    finally { setLoading(false); }
  }, [page, search, statut]);

  useEffect(() => { load(); }, [load]);

  const setAnnonceStatut = async (id: string, s: string) => {
    try {
      await api.put(`/admin/annonces/${id}/statut`, { statut: s });
      setData((d: any) => ({ ...d, annonces: d.annonces.map((a: any) => a.id === id ? { ...a, statut: s } : a) }));
    } catch { }
  };

  return (
    <div style={{ maxWidth: 1160, fontFamily: "'Syne',sans-serif" }}>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      <div style={{ marginBottom: 28 }}>
        <div style={{ fontSize: 10, color: '#10B981', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: 6 }}>Administration</div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
          <h1 style={{ fontSize: 30, fontWeight: 800, color: '#F1F5F9', margin: 0, letterSpacing: '-1px' }}>Annonces</h1>
          <span style={{ fontSize: 13, color: '#475569', fontFamily: "'JetBrains Mono',monospace" }}>{data.total} au total</span>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 10, marginBottom: 20 }}>
        <input value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} placeholder="Ville, description..." style={{ flex: 1, background: '#080F1C', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 10, padding: '9px 14px', color: '#F1F5F9', fontSize: 13, outline: 'none', fontFamily: "'Syne',sans-serif" }} />
        <select value={statut} onChange={e => { setStatut(e.target.value); setPage(1); }} style={{ background: '#080F1C', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 10, padding: '9px 14px', color: '#F1F5F9', fontSize: 13, outline: 'none', cursor: 'pointer' }}>
          <option value="">Tous statuts</option>
          {Object.keys(sColors).map(s => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      <div style={{ background: '#080F1C', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 16, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
              {['Annonce', 'Propriétaire', 'Type', 'Prix', 'Statut', 'Actions'].map(h => (
                <th key={h} style={{ padding: '12px 14px', textAlign: 'left', fontSize: 9, color: '#334155', letterSpacing: '1px', textTransform: 'uppercase', fontWeight: 600 }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={6} style={{ padding: 40, textAlign: 'center' }}>
                <div style={{ width: 30, height: 30, border: '2px solid #10B981', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin .8s linear infinite', margin: '0 auto' }} />
              </td></tr>
            ) : data.annonces.map((a: any) => {
              const [c, bg] = sColors[a.statut] || sColors.INACTIVE;
              return (
                <tr key={a.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', transition: 'background .15s' }}
                  onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.02)')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
                  <td style={{ padding: '10px 14px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
                      {a.photos?.[0] ? <img src={a.photos?.[0] ? photoUrl(a.photos[0]) as string : undefined} alt="" style={{ width: 38, height: 38, borderRadius: 8, objectFit: 'cover' }} /> : (
                        <div style={{ width: 38, height: 38, borderRadius: 8, background: 'rgba(59,130,246,.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 17 }}>🏘️</div>
                      )}
                      <div>
                        <div style={{ fontSize: 12, fontWeight: 600, color: '#E2E8F0' }}>{a.ville}{a.quartier ? `, ${a.quartier}` : ''}</div>
                        <div style={{ fontSize: 10, color: '#475569' }}>{a.adresse || '—'}</div>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: '10px 14px' }}>
                    <div style={{ fontSize: 12, color: '#CBD5E1' }}>{a.proprietaire?.prenom} {a.proprietaire?.nom}</div>
                    <div style={{ fontSize: 10, color: '#475569' }}>{a.proprietaire?.email}</div>
                  </td>
                  <td style={{ padding: '10px 14px' }}>
                    <span style={{ fontSize: 10, color: '#94A3B8', background: 'rgba(148,163,184,.1)', padding: '2px 8px', borderRadius: 6 }}>
                      {a.type === 'LOGEMENT_DISPONIBLE' ? 'Logement' : 'Colocation'}
                    </span>
                  </td>
                  <td style={{ padding: '10px 14px', fontSize: 13, fontWeight: 700, color: '#F59E0B', fontFamily: "'JetBrains Mono',monospace" }}>{(a.loyerTotal || 0).toLocaleString()} F</td>
                  <td style={{ padding: '10px 14px' }}>
                    <span style={{ fontSize: 10, fontWeight: 600, color: c, background: bg, padding: '2px 9px', borderRadius: 20 }}>{a.statut}</span>
                  </td>
                  <td style={{ padding: '10px 14px' }}>
                    <div style={{ display: 'flex', gap: 5 }}>
                      {a.statut !== 'ACTIVE' && a.statut !== 'SUPPRIMEE' && (
                        <button onClick={() => setAnnonceStatut(a.id, 'ACTIVE')} style={{ fontSize: 10, padding: '3px 9px', borderRadius: 6, border: '1px solid rgba(16,185,129,.3)', background: 'transparent', color: '#10B981', cursor: 'pointer' }}>Activer</button>
                      )}
                      {a.statut === 'ACTIVE' && (
                        <button onClick={() => setAnnonceStatut(a.id, 'MODEREE')} style={{ fontSize: 10, padding: '3px 9px', borderRadius: 6, border: '1px solid rgba(139,92,246,.3)', background: 'transparent', color: '#8B5CF6', cursor: 'pointer' }}>Modérer</button>
                      )}
                      {a.statut !== 'SUPPRIMEE' && (
                        <button onClick={() => setAnnonceStatut(a.id, 'SUPPRIMEE')} style={{ fontSize: 10, padding: '3px 9px', borderRadius: 6, border: '1px solid rgba(239,68,68,.3)', background: 'transparent', color: '#EF4444', cursor: 'pointer' }}>✕</button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {data.pages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', gap: 6, marginTop: 20 }}>
          {Array.from({ length: data.pages }, (_, i) => i + 1).map(p => (
            <button key={p} onClick={() => setPage(p)} style={{ width: 34, height: 34, borderRadius: 8, border: '1px solid', borderColor: p === page ? '#10B981' : 'rgba(255,255,255,0.08)', background: p === page ? 'rgba(16,185,129,.15)' : 'transparent', color: p === page ? '#10B981' : '#475569', cursor: 'pointer', fontSize: 12, fontFamily: "'JetBrains Mono',monospace" }}>{p}</button>
          ))}
        </div>
      )}
    </div>
  );
}