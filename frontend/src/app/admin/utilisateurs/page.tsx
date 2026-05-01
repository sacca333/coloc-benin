'use client';
import { useEffect, useState, useCallback, useRef } from 'react';
import { api, photoUrl } from '@/lib/api';

const LIMIT = 20;
const tColors: Record<string, [string,string]> = {
  ADMIN: ['#92400e','#fef3c7'],
  PROPRIETAIRE: ['#1e40af','#dbeafe'],
  ETUDIANT: ['#065f46','#d1fae5'],
};

export default function AdminUsers() {
  const [users, setUsers] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [search, setSearch] = useState('');
  const [typeCompte, setTypeCompte] = useState('');
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [busy, setBusy] = useState<string | null>(null);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const searchTimer = useRef<any>(null);

  const load = useCallback(async (p: number, s: string, t: string, reset: boolean) => {
    if (p === 1) setLoading(true); else setLoadingMore(true);
    try {
      const r = await api.get('/admin/utilisateurs', { params: { page: p, limit: LIMIT, search: s, typeCompte: t } });
      const newUsers = r.data.users || [];
      setTotal(r.data.total || 0);
      setUsers(prev => reset ? newUsers : [...prev, ...newUsers]);
      setHasMore(newUsers.length === LIMIT);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, []);

  // Reset au changement de filtre
  useEffect(() => {
    setPage(1);
    load(1, search, typeCompte, true);
  }, [search, typeCompte]);

  // Intersection Observer pour scroll infini
  useEffect(() => {
    if (!sentinelRef.current) return;
    const observer = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore && !loadingMore && !loading) {
        const next = page + 1;
        setPage(next);
        load(next, search, typeCompte, false);
      }
    }, { threshold: 0.1 });
    observer.observe(sentinelRef.current);
    return () => observer.disconnect();
  }, [hasMore, loadingMore, loading, page, search, typeCompte]);

  const handleSearch = (v: string) => {
    clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => setSearch(v), 400);
  };

  const toggle = async (id: string) => {
    setBusy(id);
    try {
      const r = await api.put(`/admin/utilisateurs/${id}/actif`);
      setUsers(prev => prev.map(u => u.id === id ? { ...u, actif: r.data.actif } : u));
    } finally { setBusy(null); }
  };

  const promote = async (id: string) => {
    if (!confirm('Promouvoir en admin ?')) return;
    try {
      await api.put(`/admin/utilisateurs/${id}/promouvoir`);
      setUsers(prev => prev.map(u => u.id === id ? { ...u, typeCompte: 'ADMIN' } : u));
    } catch {}
  };

  const del = async (id: string, name: string) => {
    if (!confirm(`Supprimer ${name} ? Irréversible.`)) return;
    setBusy(id + 'd');
    try {
      await api.delete(`/admin/utilisateurs/${id}`);
      setUsers(prev => prev.filter(u => u.id !== id));
      setTotal(t => t - 1);
    } finally { setBusy(null); }
  };

  return (
    <div style={{ fontFamily: "'Syne',sans-serif" }}>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg) } }
        @keyframes pulse { 0%,100%{opacity:1}50%{opacity:.4} }
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
        .btn-sm:disabled { opacity:0.4; cursor:default; }
        .badge { font-size:10px; font-weight:600; padding:3px 10px; border-radius:20px; }
        .skel { background:linear-gradient(90deg,#f0f9ff 25%,#e0f2fe 50%,#f0f9ff 75%); background-size:200% 100%; animation:shimmer 1.2s infinite; border-radius:6px; }
        @keyframes shimmer { 0%{background-position:200% 0}100%{background-position:-200% 0} }
        @media(max-width:768px) { .admin-table-wrap{overflow-x:auto;} .hide-mobile{display:none;} }
      `}</style>

      <div style={{ marginBottom: 28 }}>
        <div style={{ fontSize: 10, color: '#0284c7', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: 6 }}>Administration</div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: 8 }}>
          <h1 style={{ fontSize: 28, fontWeight: 800, color: '#0c4a6e', margin: 0 }}>Utilisateurs</h1>
          <span style={{ fontSize: 13, color: '#0369a1', background: '#e0f2fe', padding: '4px 14px', borderRadius: 20 }}>
            {users.length} / {total} chargés
          </span>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 10, marginBottom: 20, flexWrap: 'wrap' }}>
        <input className="admin-input" defaultValue={search} onChange={e => handleSearch(e.target.value)} placeholder="🔍  Nom, email..." />
        <select className="admin-select" value={typeCompte} onChange={e => setTypeCompte(e.target.value)}>
          <option value="">Tous les rôles</option>
          <option value="ETUDIANT">Étudiant</option>
          <option value="PROPRIETAIRE">Propriétaire</option>
          <option value="ADMIN">Admin</option>
        </select>
      </div>

      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Utilisateur</th>
              <th className="hide-mobile">Ville</th>
              <th>Rôle</th>
              <th className="hide-mobile">Abonnement</th>
              <th className="hide-mobile">Annonces</th>
              <th>Statut</th>
              <th style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              [...Array(8)].map((_, i) => (
                <tr key={i}>
                  <td><div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                    <div className="skel" style={{ width: 36, height: 36, borderRadius: '50%', flexShrink: 0 }} />
                    <div><div className="skel" style={{ width: 100, height: 12, marginBottom: 6 }} /><div className="skel" style={{ width: 140, height: 10 }} /></div>
                  </div></td>
                  {[...Array(6)].map((_, j) => <td key={j} className={j < 4 ? 'hide-mobile' : ''}><div className="skel" style={{ width: '60%', height: 12 }} /></td>)}
                </tr>
              ))
            ) : users.length === 0 ? (
              <tr><td colSpan={7} style={{ padding: '48px 20px', textAlign: 'center', color: '#64748b' }}>
                <div style={{ fontSize: 36, marginBottom: 8 }}>🔍</div>
                Aucun utilisateur trouvé
              </td></tr>
            ) : users.map(u => {
              const [tc, tcBg] = tColors[u.typeCompte] || tColors.ETUDIANT;
              return (
                <tr key={u.id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      {u.photo
                        ? <img src={photoUrl(u.photo) as string} alt="" style={{ width: 36, height: 36, borderRadius: '50%', objectFit: 'cover', border: '2px solid #bae6fd' }} />
                        : <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'linear-gradient(135deg,#0284c7,#0ea5e9)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, color: '#fff', flexShrink: 0 }}>
                            {u.prenom?.[0]}{u.nom?.[0]}
                          </div>
                      }
                      <div style={{ minWidth: 0 }}>
                        <div style={{ fontSize: 13, fontWeight: 600, color: '#0c4a6e', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 140 }}>{u.prenom} {u.nom}</div>
                        <div style={{ fontSize: 11, color: '#64748b', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 140 }}>{u.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="hide-mobile" style={{ fontSize: 12, color: '#475569' }}>{u.ville || '—'}</td>
                  <td><span className="badge" style={{ color: tc, background: tcBg }}>{u.typeCompte}</span></td>
                  <td className="hide-mobile">
                    <span className="badge" style={{ color: u.abonnements?.length ? '#065f46' : '#991b1b', background: u.abonnements?.length ? '#d1fae5' : '#fee2e2' }}>
                      {u.abonnements?.length ? 'Actif' : 'Expiré'}
                    </span>
                  </td>
                  <td className="hide-mobile" style={{ fontSize: 12, color: '#475569', fontFamily: 'monospace' }}>{u._count?.annonces || 0}</td>
                  <td>
                    <span className="badge" style={{ color: u.actif ? '#065f46' : '#991b1b', background: u.actif ? '#d1fae5' : '#fee2e2' }}>
                      {u.actif ? '● Actif' : '○ Bloqué'}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: 4, justifyContent: 'flex-end', flexWrap: 'wrap' }}>
                      <button className="btn-sm" onClick={() => toggle(u.id)} disabled={!!busy}
                        style={{ borderColor: u.actif ? '#fca5a5' : '#86efac', color: u.actif ? '#dc2626' : '#16a34a' }}>
                        {busy === u.id ? '…' : u.actif ? 'Bloquer' : 'Activer'}
                      </button>
                      {u.typeCompte !== 'ADMIN' && (
                        <button className="btn-sm" onClick={() => promote(u.id)} style={{ borderColor: '#fcd34d', color: '#92400e' }}>★</button>
                      )}
                      <button className="btn-sm" onClick={() => del(u.id, `${u.prenom} ${u.nom}`)} disabled={!!busy}
                        style={{ borderColor: '#fca5a5', color: '#dc2626' }}>
                        {busy === u.id + 'd' ? '…' : '✕'}
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {/* Sentinel + loader scroll infini */}
        <div ref={sentinelRef} style={{ height: 1 }} />
        {loadingMore && (
          <div style={{ padding: '16px', textAlign: 'center' }}>
            <div style={{ width: 24, height: 24, border: '3px solid #0284c7', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin .8s linear infinite', margin: '0 auto' }} />
          </div>
        )}
        {!hasMore && users.length > 0 && (
          <div style={{ padding: '14px', textAlign: 'center', fontSize: 12, color: '#94a3b8', borderTop: '1px solid #f0f9ff' }}>
            ✓ Tous les {total} utilisateurs sont chargés
          </div>
        )}
      </div>
    </div>
  );
}
