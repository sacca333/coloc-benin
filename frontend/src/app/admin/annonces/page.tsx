'use client';
import { useEffect, useState, useCallback, useRef } from 'react';
import { api, photoUrl } from '@/lib/api';

const LIMIT = 20;
const sColors: Record<string, [string,string]> = {
  ACTIVE:    ['#065f46','#d1fae5'],
  INACTIVE:  ['#92400e','#fef3c7'],
  MODEREE:   ['#5b21b6','#ede9fe'],
  SUPPRIMEE: ['#991b1b','#fee2e2'],
};

export default function AdminAnnonces() {
  const [annonces, setAnnonces] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [search, setSearch] = useState('');
  const [statut, setStatut] = useState('');
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const searchTimer = useRef<any>(null);

  const load = useCallback(async (p: number, s: string, st: string, reset: boolean) => {
    if (p === 1) setLoading(true); else setLoadingMore(true);
    try {
      const r = await api.get('/admin/annonces', { params: { page: p, limit: LIMIT, search: s, statut: st } });
      const items = r.data.annonces || [];
      setTotal(r.data.total || 0);
      setAnnonces(prev => reset ? items : [...prev, ...items]);
      setHasMore(items.length === LIMIT);
    } finally { setLoading(false); setLoadingMore(false); }
  }, []);

  useEffect(() => { setPage(1); load(1, search, statut, true); }, [search, statut]);

  useEffect(() => {
    if (!sentinelRef.current) return;
    const observer = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore && !loadingMore && !loading) {
        const next = page + 1; setPage(next); load(next, search, statut, false);
      }
    }, { threshold: 0.1 });
    observer.observe(sentinelRef.current);
    return () => observer.disconnect();
  }, [hasMore, loadingMore, loading, page, search, statut]);

  const handleSearch = (v: string) => { clearTimeout(searchTimer.current); searchTimer.current = setTimeout(() => setSearch(v), 400); };

  const setAnnonceStatut = async (id: string, s: string) => {
    try {
      await api.put(`/admin/annonces/${id}/statut`, { statut: s });
      setAnnonces(prev => prev.map(a => a.id === id ? { ...a, statut: s } : a));
    } catch {}
  };

  return (
    <div style={{ fontFamily: "'Syne',sans-serif" }}>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg) } }
        @keyframes shimmer { 0%{background-position:200% 0}100%{background-position:-200% 0} }
        .admin-table-wrap { background:#fff; border:1px solid #e0f2fe; border-radius:16px; overflow:hidden; box-shadow:0 1px 4px rgba(0,0,0,0.06); }
        .admin-table { width:100%; border-collapse:collapse; }
        .admin-table th { padding:12px 14px; text-align:left; font-size:11px; color:#0369a1; letter-spacing:1px; text-transform:uppercase; font-weight:600; background:#f0f9ff; border-bottom:1px solid #e0f2fe; white-space:nowrap; }
        .admin-table td { padding:10px 14px; border-bottom:1px solid #f0f9ff; vertical-align:middle; }
        .admin-table tr:last-child td { border-bottom:none; }
        .admin-table tr:hover td { background:#f0f9ff; }
        .admin-input { flex:1; min-width:160px; background:#fff; border:1px solid #bae6fd; border-radius:10px; padding:9px 14px; color:#0c4a6e; font-size:13px; outline:none; font-family:"Syne",sans-serif; }
        .admin-input:focus { border-color:#0284c7; box-shadow:0 0 0 3px rgba(2,132,199,0.1); }
        .admin-select { background:#fff; border:1px solid #bae6fd; border-radius:10px; padding:9px 14px; color:#0c4a6e; font-size:13px; outline:none; cursor:pointer; }
        .btn-sm { font-size:11px; padding:4px 10px; border-radius:6px; border:1px solid; cursor:pointer; font-family:"Syne",sans-serif; transition:opacity .15s; white-space:nowrap; background:#fff; }
        .btn-sm:hover { opacity:0.8; }
        .badge { font-size:10px; font-weight:600; padding:3px 10px; border-radius:20px; }
        .skel { background:linear-gradient(90deg,#f0f9ff 25%,#e0f2fe 50%,#f0f9ff 75%); background-size:200% 100%; animation:shimmer 1.2s infinite; border-radius:6px; }
        @media(max-width:768px) { .admin-table-wrap{overflow-x:auto;} .hide-mobile{display:none;} }
      `}</style>

      <div style={{ marginBottom: 28 }}>
        <div style={{ fontSize: 10, color: '#0284c7', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: 6 }}>Administration</div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: 8 }}>
          <h1 style={{ fontSize: 28, fontWeight: 800, color: '#0c4a6e', margin: 0 }}>Annonces</h1>
          <span style={{ fontSize: 13, color: '#0369a1', background: '#e0f2fe', padding: '4px 14px', borderRadius: 20 }}>{annonces.length} / {total} chargées</span>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 10, marginBottom: 20, flexWrap: 'wrap' }}>
        <input className="admin-input" defaultValue={search} onChange={e => handleSearch(e.target.value)} placeholder="🔍  Ville, description..." />
        <select className="admin-select" value={statut} onChange={e => setStatut(e.target.value)}>
          <option value="">Tous les statuts</option>
          {Object.keys(sColors).map(s => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Annonce</th>
              <th className="hide-mobile">Propriétaire</th>
              <th className="hide-mobile">Type</th>
              <th>Prix</th>
              <th>Statut</th>
              <th style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              [...Array(6)].map((_, i) => (
                <tr key={i}>
                  <td><div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                    <div className="skel" style={{ width: 38, height: 38, borderRadius: 8, flexShrink: 0 }} />
                    <div><div className="skel" style={{ width: 100, height: 12, marginBottom: 6 }} /><div className="skel" style={{ width: 80, height: 10 }} /></div>
                  </div></td>
                  {[...Array(5)].map((_, j) => <td key={j} className={j < 2 ? 'hide-mobile' : ''}><div className="skel" style={{ width: '60%', height: 12 }} /></td>)}
                </tr>
              ))
            ) : annonces.length === 0 ? (
              <tr><td colSpan={6} style={{ padding: '48px 20px', textAlign: 'center', color: '#64748b' }}>
                <div style={{ fontSize: 36, marginBottom: 8 }}>🏘️</div>Aucune annonce trouvée
              </td></tr>
            ) : annonces.map(a => {
              const [c, bg] = sColors[a.statut] || sColors.INACTIVE;
              return (
                <tr key={a.id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
                      {a.photos?.[0]
                        ? <img src={photoUrl(a.photos[0]) as string} alt="" style={{ width: 38, height: 38, borderRadius: 8, objectFit: 'cover', border: '1px solid #e0f2fe' }} />
                        : <div style={{ width: 38, height: 38, borderRadius: 8, background: '#e0f2fe', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>🏘️</div>
                      }
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 600, color: '#0c4a6e' }}>{a.ville}{a.quartier ? `, ${a.quartier}` : ''}</div>
                        <div style={{ fontSize: 11, color: '#64748b' }}>{a.adresse || '—'}</div>
                      </div>
                    </div>
                  </td>
                  <td className="hide-mobile">
                    <div style={{ fontSize: 12, color: '#0c4a6e', fontWeight: 500 }}>{a.proprietaire?.prenom} {a.proprietaire?.nom}</div>
                    <div style={{ fontSize: 11, color: '#64748b' }}>{a.proprietaire?.email}</div>
                  </td>
                  <td className="hide-mobile">
                    <span className="badge" style={{ color: '#1e40af', background: '#dbeafe' }}>
                      {a.type === 'LOGEMENT_DISPONIBLE' ? 'Logement' : 'Colocation'}
                    </span>
                  </td>
                  <td style={{ fontSize: 13, fontWeight: 700, color: '#0284c7', whiteSpace: 'nowrap' }}>{(a.loyerTotal || 0).toLocaleString()} F</td>
                  <td><span className="badge" style={{ color: c, background: bg }}>{a.statut}</span></td>
                  <td>
                    <div style={{ display: 'flex', gap: 4, justifyContent: 'flex-end', flexWrap: 'wrap' }}>
                      {a.statut !== 'ACTIVE' && a.statut !== 'SUPPRIMEE' && (
                        <button className="btn-sm" onClick={() => setAnnonceStatut(a.id, 'ACTIVE')} style={{ borderColor: '#86efac', color: '#16a34a' }}>Activer</button>
                      )}
                      {a.statut === 'ACTIVE' && (
                        <button className="btn-sm" onClick={() => setAnnonceStatut(a.id, 'MODEREE')} style={{ borderColor: '#c4b5fd', color: '#7c3aed' }}>Modérer</button>
                      )}
                      {a.statut !== 'SUPPRIMEE' && (
                        <button className="btn-sm" onClick={() => setAnnonceStatut(a.id, 'SUPPRIMEE')} style={{ borderColor: '#fca5a5', color: '#dc2626' }}>✕</button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        <div ref={sentinelRef} style={{ height: 1 }} />
        {loadingMore && (
          <div style={{ padding: 16, textAlign: 'center' }}>
            <div style={{ width: 24, height: 24, border: '3px solid #0284c7', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin .8s linear infinite', margin: '0 auto' }} />
          </div>
        )}
        {!hasMore && annonces.length > 0 && (
          <div style={{ padding: 14, textAlign: 'center', fontSize: 12, color: '#94a3b8', borderTop: '1px solid #f0f9ff' }}>
            ✓ Toutes les {total} annonces sont chargées
          </div>
        )}
      </div>
    </div>
  );
}
