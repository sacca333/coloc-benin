'use client';
import { useEffect, useState, useCallback, useRef } from 'react';
import { api, photoUrl } from '@/lib/api';

const LIMIT = 20;
const sC: Record<string, [string,string]> = {
  ACTIF:      ['#065f46','#d1fae5'],
  EXPIRE:     ['#991b1b','#fee2e2'],
  EN_ATTENTE: ['#92400e','#fef3c7'],
  ECHEC:      ['#374151','#f3f4f6'],
};

export default function AdminAbonnements() {
  const [abonnements, setAbonnements] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [statut, setStatut] = useState('');
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const sentinelRef = useRef<HTMLDivElement>(null);

  const load = useCallback(async (p: number, st: string, reset: boolean) => {
    if (p === 1) setLoading(true); else setLoadingMore(true);
    try {
      const r = await api.get('/admin/abonnements', { params: { page: p, limit: LIMIT, statut: st } });
      const items = r.data.abonnements || [];
      setTotal(r.data.total || 0);
      setAbonnements(prev => reset ? items : [...prev, ...items]);
      setHasMore(items.length === LIMIT);
    } finally { setLoading(false); setLoadingMore(false); }
  }, []);

  useEffect(() => { setPage(1); load(1, statut, true); }, [statut]);

  useEffect(() => {
    if (!sentinelRef.current) return;
    const observer = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore && !loadingMore && !loading) {
        const next = page + 1; setPage(next); load(next, statut, false);
      }
    }, { threshold: 0.1 });
    observer.observe(sentinelRef.current);
    return () => observer.disconnect();
  }, [hasMore, loadingMore, loading, page, statut]);

  const setStatutAbo = async (id: string, s: string) => {
    try {
      await api.put(`/admin/abonnements/${id}/statut`, { statut: s });
      setAbonnements(prev => prev.map(a => a.id === id ? { ...a, statut: s } : a));
    } catch {}
  };

  const exportCSV = () => { window.open(process.env.NEXT_PUBLIC_API_URL + '/admin/abonnements/export', '_blank'); };

  const revenusPage = abonnements.filter(a => a.statut === 'ACTIF').reduce((s, a) => s + (a.montant || 0), 0);

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
        .btn-sm { font-size:11px; padding:4px 10px; border-radius:6px; border:1px solid; cursor:pointer; font-family:"Syne",sans-serif; transition:opacity .15s; white-space:nowrap; background:#fff; }
        .btn-sm:hover { opacity:0.8; }
        .badge { font-size:10px; font-weight:600; padding:3px 10px; border-radius:20px; }
        .filter-btn { font-size:11px; padding:6px 14px; border-radius:20px; border:1px solid #bae6fd; background:#fff; color:#0369a1; cursor:pointer; font-weight:600; transition:all .2s; }
        .filter-btn.on { background:#0284c7; color:#fff; border-color:#0284c7; }
        .skel { background:linear-gradient(90deg,#f0f9ff 25%,#e0f2fe 50%,#f0f9ff 75%); background-size:200% 100%; animation:shimmer 1.2s infinite; border-radius:6px; }
        @media(max-width:768px) { .admin-table-wrap{overflow-x:auto;} .hide-mobile{display:none;} }
      `}</style>

      <div style={{ marginBottom: 28 }}>
        <div style={{ fontSize: 10, color: '#0284c7', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: 6 }}>Administration</div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: 8 }}>
          <h1 style={{ fontSize: 28, fontWeight: 800, color: '#0c4a6e', margin: 0 }}>Abonnements</h1>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 20, fontWeight: 800, color: '#0284c7' }}>{revenusPage.toLocaleString()} FCFA</div>
            <div style={{ fontSize: 11, color: '#64748b' }}>{abonnements.length} / {total} chargés</div>
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap', alignItems: 'center' }}>
        {Object.entries(sC).map(([s, [c]]) => (
          <button key={s} className={`filter-btn${statut === s ? ' on' : ''}`} onClick={() => setStatut(s === statut ? '' : s)}>{s}</button>
        ))}
        <div style={{ flex: 1 }} />
        <button className="btn-sm" onClick={exportCSV} style={{ borderColor: '#86efac', color: '#16a34a', padding: '6px 16px', borderRadius: 20 }}>↓ Export CSV</button>
      </div>

      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Utilisateur</th>
              <th className="hide-mobile">Opérateur</th>
              <th>Montant</th>
              <th className="hide-mobile">Période</th>
              <th>Statut</th>
              <th style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              [...Array(6)].map((_, i) => (
                <tr key={i}>
                  <td><div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                    <div className="skel" style={{ width: 34, height: 34, borderRadius: '50%', flexShrink: 0 }} />
                    <div><div className="skel" style={{ width: 100, height: 12, marginBottom: 6 }} /><div className="skel" style={{ width: 120, height: 10 }} /></div>
                  </div></td>
                  {[...Array(5)].map((_, j) => <td key={j} className={j === 0 || j === 2 ? 'hide-mobile' : ''}><div className="skel" style={{ width: '60%', height: 12 }} /></td>)}
                </tr>
              ))
            ) : abonnements.length === 0 ? (
              <tr><td colSpan={6} style={{ padding: '48px 20px', textAlign: 'center', color: '#64748b' }}>
                <div style={{ fontSize: 36, marginBottom: 8 }}>💳</div>Aucun abonnement trouvé
              </td></tr>
            ) : abonnements.map(a => {
              const [c, bg] = sC[a.statut] || sC.ECHEC;
              const fin = a.periodeFin ? new Date(a.periodeFin) : null;
              const jours = fin ? Math.ceil((fin.getTime() - Date.now()) / 86400000) : 0;
              return (
                <tr key={a.id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
                      {a.utilisateur?.photo
                        ? <img src={photoUrl(a.utilisateur.photo) as string} alt="" style={{ width: 34, height: 34, borderRadius: '50%', objectFit: 'cover', border: '2px solid #bae6fd' }} />
                        : <div style={{ width: 34, height: 34, borderRadius: '50%', background: 'linear-gradient(135deg,#0284c7,#0ea5e9)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, color: '#fff', flexShrink: 0 }}>
                            {a.utilisateur?.prenom?.[0]}{a.utilisateur?.nom?.[0]}
                          </div>
                      }
                      <div style={{ minWidth: 0 }}>
                        <div style={{ fontSize: 12, fontWeight: 600, color: '#0c4a6e', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 130 }}>{a.utilisateur?.prenom} {a.utilisateur?.nom}</div>
                        <div style={{ fontSize: 11, color: '#64748b', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 130 }}>{a.utilisateur?.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="hide-mobile" style={{ fontSize: 12, color: '#475569' }}>
                    {a.operateur === 'MOMO' ? '📱' : a.operateur === 'CCASH' ? '💳' : '📲'} {a.operateur}
                  </td>
                  <td style={{ fontSize: 14, fontWeight: 700, color: '#0284c7', whiteSpace: 'nowrap' }}>{(a.montant || 0).toLocaleString()} F</td>
                  <td className="hide-mobile">
                    <div style={{ fontSize: 11, color: '#475569' }}>
                      {a.periodeDebut ? new Date(a.periodeDebut).toLocaleDateString('fr-FR') : '—'} → {fin ? fin.toLocaleDateString('fr-FR') : '—'}
                    </div>
                    {a.statut === 'ACTIF' && fin && (
                      <div style={{ fontSize: 10, fontWeight: 600, color: jours <= 7 ? '#dc2626' : jours <= 15 ? '#d97706' : '#16a34a' }}>
                        {jours > 0 ? `${jours}j restants` : 'Expiré'}
                      </div>
                    )}
                  </td>
                  <td><span className="badge" style={{ color: c, background: bg }}>{a.statut}</span></td>
                  <td>
                    <div style={{ display: 'flex', gap: 4, justifyContent: 'flex-end' }}>
                      {a.statut !== 'ACTIF' && (
                        <button className="btn-sm" onClick={() => setStatutAbo(a.id, 'ACTIF')} style={{ borderColor: '#86efac', color: '#16a34a' }}>Activer</button>
                      )}
                      {a.statut === 'ACTIF' && (
                        <button className="btn-sm" onClick={() => setStatutAbo(a.id, 'EXPIRE')} style={{ borderColor: '#fca5a5', color: '#dc2626' }}>Expirer</button>
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
        {!hasMore && abonnements.length > 0 && (
          <div style={{ padding: 14, textAlign: 'center', fontSize: 12, color: '#94a3b8', borderTop: '1px solid #f0f9ff' }}>
            ✓ Tous les {total} abonnements sont chargés
          </div>
        )}
      </div>
    </div>
  );
}
