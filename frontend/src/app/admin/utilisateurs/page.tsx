'use client';
import { useEffect, useState, useCallback } from 'react';
import { api, photoUrl } from '@/lib/api';

const tColors: Record<string, string> = { ADMIN: '#F59E0B', PROPRIETAIRE: '#3B82F6', ETUDIANT: '#10B981' };

export default function AdminUsers() {
  const [data, setData] = useState<any>({ users: [], total: 0, pages: 1 });
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [typeCompte, setTypeCompte] = useState('');
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try { const r = await api.get('/admin/utilisateurs', { params: { page, limit: 20, search, typeCompte } }); setData(r.data); }
    finally { setLoading(false); }
  }, [page, search, typeCompte]);

  useEffect(() => { load(); }, [load]);

  const toggle = async (id: string) => {
    setBusy(id);
    try {
      const r = await api.put(`/admin/utilisateurs/${id}/actif`);
      setData((d: any) => ({ ...d, users: d.users.map((u: any) => u.id === id ? { ...u, actif: r.data.actif } : u) }));
    } finally { setBusy(null); }
  };

  const promote = async (id: string) => {
    if (!confirm('Promouvoir en admin ?')) return;
    try {
      await api.put(`/admin/utilisateurs/${id}/promouvoir`);
      setData((d: any) => ({ ...d, users: d.users.map((u: any) => u.id === id ? { ...u, typeCompte: 'ADMIN' } : u) }));
    } catch { }
  };

  const del = async (id: string, name: string) => {
    if (!confirm(`Supprimer ${name} ? Irréversible.`)) return;
    setBusy(id + 'd');
    try {
      await api.delete(`/admin/utilisateurs/${id}`);
      setData((d: any) => ({ ...d, users: d.users.filter((u: any) => u.id !== id), total: d.total - 1 }));
    } finally { setBusy(null); }
  };

  return (
    <div style={{ maxWidth: 1160, fontFamily: "'Syne',sans-serif" }}>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      <div style={{ marginBottom: 28 }}>
        <div style={{ fontSize: 10, color: '#10B981', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: 6 }}>Administration</div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
          <h1 style={{ fontSize: 30, fontWeight: 800, color: '#F1F5F9', margin: 0, letterSpacing: '-1px' }}>Utilisateurs</h1>
          <span style={{ fontSize: 13, color: '#475569', fontFamily: "'JetBrains Mono',monospace" }}>{data.total} au total</span>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 10, marginBottom: 20 }}>
        <input value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} placeholder="Nom, email..." style={{ flex: 1, background: '#080F1C', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 10, padding: '9px 14px', color: '#F1F5F9', fontSize: 13, outline: 'none', fontFamily: "'Syne',sans-serif" }} />
        <select value={typeCompte} onChange={e => { setTypeCompte(e.target.value); setPage(1); }} style={{ background: '#080F1C', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 10, padding: '9px 14px', color: '#F1F5F9', fontSize: 13, outline: 'none', cursor: 'pointer' }}>
          <option value="">Tous rôles</option>
          <option value="ETUDIANT">Étudiant</option>
          <option value="PROPRIETAIRE">Propriétaire</option>
          <option value="ADMIN">Admin</option>
        </select>
      </div>

      <div style={{ background: '#080F1C', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 16, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
              {['Utilisateur', 'Ville', 'Rôle', 'Abo.', 'Annonces', 'Statut', 'Actions'].map(h => (
                <th key={h} style={{ padding: '12px 14px', textAlign: 'left', fontSize: 9, color: '#334155', letterSpacing: '1px', textTransform: 'uppercase', fontWeight: 600 }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={7} style={{ padding: 40, textAlign: 'center' }}>
                <div style={{ width: 30, height: 30, border: '2px solid #10B981', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin .8s linear infinite', margin: '0 auto' }} />
              </td></tr>
            ) : data.users.map((u: any) => (
              <tr key={u.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', transition: 'background .15s' }}
                onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.02)')}
                onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
                <td style={{ padding: '10px 14px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
                    {u.photo ? <img src={u.photo ? photoUrl(u.photo) as string : undefined} alt="" style={{ width: 34, height: 34, borderRadius: '50%', objectFit: 'cover' }} /> : (
                      <div style={{ width: 34, height: 34, borderRadius: '50%', background: 'linear-gradient(135deg,#10B981,#3B82F6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, color: '#fff' }}>
                        {u.prenom?.[0]}{u.nom?.[0]}
                      </div>
                    )}
                    <div>
                      <div style={{ fontSize: 12, fontWeight: 600, color: '#E2E8F0' }}>{u.prenom} {u.nom}</div>
                      <div style={{ fontSize: 10, color: '#475569' }}>{u.email}</div>
                    </div>
                  </div>
                </td>
                <td style={{ padding: '10px 14px', fontSize: 12, color: '#94A3B8' }}>{u.ville || '—'}</td>
                <td style={{ padding: '10px 14px' }}>
                  <span style={{ fontSize: 10, fontWeight: 600, color: tColors[u.typeCompte] || '#10B981', background: (tColors[u.typeCompte] || '#10B981') + '18', padding: '2px 9px', borderRadius: 20 }}>{u.typeCompte}</span>
                </td>
                <td style={{ padding: '10px 14px' }}>
                  <span style={{ fontSize: 10, color: u.abonnements?.length ? '#10B981' : '#EF4444', background: u.abonnements?.length ? 'rgba(16,185,129,.1)' : 'rgba(239,68,68,.1)', padding: '2px 9px', borderRadius: 20 }}>
                    {u.abonnements?.length ? 'ACTIF' : 'EXPIRÉ'}
                  </span>
                </td>
                <td style={{ padding: '10px 14px', fontSize: 12, color: '#94A3B8', fontFamily: "'JetBrains Mono',monospace" }}>{u._count?.annonces || 0}</td>
                <td style={{ padding: '10px 14px' }}>
                  <span style={{ fontSize: 10, color: u.actif ? '#10B981' : '#EF4444', background: u.actif ? 'rgba(16,185,129,.1)' : 'rgba(239,68,68,.1)', padding: '2px 9px', borderRadius: 20 }}>{u.actif ? 'Actif' : 'Bloqué'}</span>
                </td>
                <td style={{ padding: '10px 14px' }}>
                  <div style={{ display: 'flex', gap: 5 }}>
                    <button onClick={() => toggle(u.id)} disabled={!!busy} style={{ fontSize: 10, padding: '3px 9px', borderRadius: 6, border: '1px solid', borderColor: u.actif ? 'rgba(239,68,68,.3)' : 'rgba(16,185,129,.3)', background: 'transparent', color: u.actif ? '#EF4444' : '#10B981', cursor: 'pointer' }}>
                      {busy === u.id ? '…' : u.actif ? 'Bloquer' : 'Activer'}
                    </button>
                    {u.typeCompte !== 'ADMIN' && (
                      <button onClick={() => promote(u.id)} style={{ fontSize: 10, padding: '3px 9px', borderRadius: 6, border: '1px solid rgba(245,158,11,.3)', background: 'transparent', color: '#F59E0B', cursor: 'pointer' }}>★</button>
                    )}
                    <button onClick={() => del(u.id, `${u.prenom} ${u.nom}`)} style={{ fontSize: 10, padding: '3px 9px', borderRadius: 6, border: '1px solid rgba(239,68,68,.3)', background: 'transparent', color: '#EF4444', cursor: 'pointer' }}>
                      {busy === u.id + 'd' ? '…' : '✕'}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
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