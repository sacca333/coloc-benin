'use client';
import { useEffect, useState, useCallback } from 'react';
import { api } from '@/lib/api';

const photoUrl = (p: string) => `${process.env.NEXT_PUBLIC_API_URL?.replace('/api', '')}${p}`;
const tColors: Record<string, [string, string]> = {
    ADMIN: ['#F59E0B', 'rgba(245,158,11,.12)'],
    PROPRIETAIRE: ['#3B82F6', 'rgba(59,130,246,.12)'],
    ETUDIANT: ['#10B981', 'rgba(16,185,129,.12)'],
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

export default function AdminUsers() {
    const [data, setData] = useState<any>({ users: [], total: 0, pages: 1 });
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState('');
    const [typeCompte, setTypeCompte] = useState('');
    const [loading, setLoading] = useState(true);
    const [busy, setBusy] = useState<string | null>(null);
    const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);
    const [sortField, setSortField] = useState('createdAt');
    const [selected, setSelected] = useState<string[]>([]);

    const showToast = (msg: string, type: 'success' | 'error' = 'success') => setToast({ msg, type });

    const load = useCallback(async () => {
        setLoading(true);
        try {
            const r = await api.get('/admin/utilisateurs', { params: { page, limit: 20, search, typeCompte } });
            setData(r.data);
        } catch { showToast('Erreur de chargement', 'error'); }
        finally { setLoading(false); }
    }, [page, search, typeCompte]);

    useEffect(() => { load(); }, [load]);

    const toggle = async (id: string) => {
        setBusy(id);
        try {
            const r = await api.put(`/admin/utilisateurs/${id}/actif`);
            setData((d: any) => ({ ...d, users: d.users.map((u: any) => u.id === id ? { ...u, actif: r.data.actif } : u) }));
            showToast(r.data.actif ? 'Compte activé' : 'Compte bloqué');
        } catch { showToast('Erreur', 'error'); }
        finally { setBusy(null); }
    };

    const promote = async (id: string, nom: string) => {
        if (!confirm(`Promouvoir ${nom} en administrateur ?`)) return;
        try {
            await api.put(`/admin/utilisateurs/${id}/promouvoir`);
            setData((d: any) => ({ ...d, users: d.users.map((u: any) => u.id === id ? { ...u, typeCompte: 'ADMIN' } : u) }));
            showToast(`${nom} est maintenant admin`);
        } catch { showToast('Erreur', 'error'); }
    };

    const del = async (id: string, name: string) => {
        if (!confirm(`Supprimer ${name} ? Action irréversible.`)) return;
        setBusy(id + 'd');
        try {
            await api.delete(`/admin/utilisateurs/${id}`);
            setData((d: any) => ({ ...d, users: d.users.filter((u: any) => u.id !== id), total: d.total - 1 }));
            showToast(`${name} supprimé`);
        } catch { showToast('Erreur suppression', 'error'); }
        finally { setBusy(null); }
    };

    const SortHeader = ({ field, label }: { field: string; label: string }) => (
        <th onClick={() => setSortField(field)} style={{ padding: '12px 14px', textAlign: 'left', fontSize: 9, color: sortField === field ? '#10B981' : '#334155', letterSpacing: '1px', textTransform: 'uppercase', fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap', userSelect: 'none' }}>
            {label} {sortField === field ? '↓' : ''}
        </th>
    );

    return (
        <div style={{ maxWidth: 1200, fontFamily: "'Syne',sans-serif" }}>
            <style>{`
        @keyframes shimmer{0%{background-position:-200% 0}100%{background-position:200% 0}}
        @keyframes slideUp{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}
      `}</style>
            {toast && <Toast msg={toast.msg} type={toast.type} onClose={() => setToast(null)} />}

            {/* Header */}
            <div style={{ marginBottom: 28 }}>
                <div style={{ fontSize: 10, color: '#10B981', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: 6 }}>Administration</div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: 12 }}>
                    <div>
                        <h1 style={{ fontSize: 30, fontWeight: 800, color: '#F1F5F9', margin: 0, letterSpacing: '-1px' }}>Utilisateurs</h1>
                        <p style={{ color: '#334155', margin: '4px 0 0', fontSize: 12 }}>Gérer les comptes de la plateforme</p>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        {selected.length > 0 && (
                            <span style={{ fontSize: 12, color: '#F59E0B', background: 'rgba(245,158,11,.1)', padding: '6px 12px', borderRadius: 20 }}>{selected.length} sélectionné(s)</span>
                        )}
                        <span style={{ fontSize: 13, color: '#475569', fontFamily: "'JetBrains Mono',monospace", background: 'rgba(255,255,255,0.04)', padding: '6px 14px', borderRadius: 20 }}>
                            {data.total} utilisateurs
                        </span>
                    </div>
                </div>
            </div>

            {/* Filtres */}
            <div style={{ display: 'flex', gap: 10, marginBottom: 20, flexWrap: 'wrap' }}>
                <div style={{ position: 'relative', flex: 1, minWidth: 200 }}>
                    <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#334155', fontSize: 14 }}>🔍</span>
                    <input value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} placeholder="Rechercher nom, email, ville..."
                        style={{ width: '100%', background: '#080F1C', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 10, padding: '9px 14px 9px 36px', color: '#F1F5F9', fontSize: 13, outline: 'none', fontFamily: "'Syne',sans-serif", boxSizing: 'border-box', transition: 'border-color .2s' }}
                        onFocus={e => (e.target.style.borderColor = 'rgba(16,185,129,.4)')}
                        onBlur={e => (e.target.style.borderColor = 'rgba(255,255,255,0.08)')} />
                </div>
                <select value={typeCompte} onChange={e => { setTypeCompte(e.target.value); setPage(1); }}
                    style={{ background: '#080F1C', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 10, padding: '9px 14px', color: typeCompte ? '#F1F5F9' : '#475569', fontSize: 13, outline: 'none', cursor: 'pointer' }}>
                    <option value="">Tous les rôles</option>
                    <option value="ETUDIANT">Étudiant</option>
                    <option value="PROPRIETAIRE">Propriétaire</option>
                    <option value="ADMIN">Admin</option>
                </select>
                {(search || typeCompte) && (
                    <button onClick={() => { setSearch(''); setTypeCompte(''); setPage(1); }}
                        style={{ background: 'rgba(239,68,68,.08)', border: '1px solid rgba(239,68,68,.2)', borderRadius: 10, padding: '9px 14px', color: '#EF4444', fontSize: 12, cursor: 'pointer', fontFamily: "'Syne',sans-serif" }}>
                        ✕ Réinitialiser
                    </button>
                )}
            </div>

            {/* Table */}
            <div style={{ background: '#080F1C', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 16, overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.06)', background: 'rgba(255,255,255,0.02)' }}>
                            <SortHeader field="nom" label="Utilisateur" />
                            <SortHeader field="ville" label="Ville" />
                            <SortHeader field="typeCompte" label="Rôle" />
                            <th style={{ padding: '12px 14px', textAlign: 'left', fontSize: 9, color: '#334155', letterSpacing: '1px', textTransform: 'uppercase', fontWeight: 600 }}>Abonnement</th>
                            <SortHeader field="annonces" label="Annonces" />
                            <SortHeader field="actif" label="Statut" />
                            <th style={{ padding: '12px 14px', textAlign: 'right', fontSize: 9, color: '#334155', letterSpacing: '1px', textTransform: 'uppercase', fontWeight: 600 }}>Actions</th>
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
                        )) : data.users.length === 0 ? (
                            <tr><td colSpan={7} style={{ padding: '60px 20px', textAlign: 'center' }}>
                                <div style={{ fontSize: 40, marginBottom: 12 }}>🔍</div>
                                <div style={{ fontSize: 14, color: '#475569' }}>Aucun utilisateur trouvé</div>
                                <div style={{ fontSize: 12, color: '#334155', marginTop: 4 }}>Modifiez vos critères de recherche</div>
                            </td></tr>
                        ) : data.users.map((u: any) => {
                            const [tc, tcBg] = tColors[u.typeCompte] || tColors.ETUDIANT;
                            return (
                                <tr key={u.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', transition: 'background .15s' }}
                                    onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.02)')}
                                    onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
                                    <td style={{ padding: '10px 14px' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                            {u.photo ? (
                                                <img src={photoUrl(u.photo)} alt="" style={{ width: 36, height: 36, borderRadius: '50%', objectFit: 'cover', border: '2px solid rgba(16,185,129,.2)' }} />
                                            ) : (
                                                <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'linear-gradient(135deg,#10B981,#3B82F6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, color: '#fff', flexShrink: 0 }}>
                                                    {u.prenom?.[0]}{u.nom?.[0]}
                                                </div>
                                            )}
                                            <div>
                                                <div style={{ fontSize: 13, fontWeight: 600, color: '#E2E8F0' }}>{u.prenom} {u.nom}</div>
                                                <div style={{ fontSize: 10, color: '#334155' }}>{u.email}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td style={{ padding: '10px 14px', fontSize: 12, color: '#64748B' }}>{u.ville || '—'}</td>
                                    <td style={{ padding: '10px 14px' }}>
                                        <span style={{ fontSize: 10, fontWeight: 700, color: tc, background: tcBg, padding: '3px 10px', borderRadius: 20 }}>{u.typeCompte}</span>
                                    </td>
                                    <td style={{ padding: '10px 14px' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                            <div style={{ width: 6, height: 6, borderRadius: '50%', background: u.abonnements?.length ? '#10B981' : '#EF4444' }} />
                                            <span style={{ fontSize: 11, color: u.abonnements?.length ? '#10B981' : '#EF4444' }}>
                                                {u.abonnements?.length ? 'Actif' : 'Expiré'}
                                            </span>
                                        </div>
                                    </td>
                                    <td style={{ padding: '10px 14px', fontSize: 12, color: '#64748B', fontFamily: "'JetBrains Mono',monospace" }}>
                                        {u._count?.annonces ?? 0}
                                    </td>
                                    <td style={{ padding: '10px 14px' }}>
                                        <span style={{ fontSize: 10, fontWeight: 600, color: u.actif ? '#10B981' : '#EF4444', background: u.actif ? 'rgba(16,185,129,.1)' : 'rgba(239,68,68,.1)', padding: '3px 9px', borderRadius: 20 }}>
                                            {u.actif ? '● Actif' : '○ Bloqué'}
                                        </span>
                                    </td>
                                    <td style={{ padding: '10px 14px' }}>
                                        <div style={{ display: 'flex', gap: 5, justifyContent: 'flex-end' }}>
                                            <button onClick={() => toggle(u.id)} disabled={!!busy} title={u.actif ? 'Bloquer' : 'Activer'}
                                                style={{ fontSize: 11, padding: '4px 10px', borderRadius: 7, border: '1px solid', borderColor: u.actif ? 'rgba(239,68,68,.25)' : 'rgba(16,185,129,.25)', background: u.actif ? 'rgba(239,68,68,.06)' : 'rgba(16,185,129,.06)', color: u.actif ? '#EF4444' : '#10B981', cursor: 'pointer', transition: 'all .15s' }}>
                                                {busy === u.id ? '…' : u.actif ? 'Bloquer' : 'Activer'}
                                            </button>
                                            {u.typeCompte !== 'ADMIN' && (
                                                <button onClick={() => promote(u.id, `${u.prenom} ${u.nom}`)} title="Promouvoir admin"
                                                    style={{ fontSize: 11, padding: '4px 10px', borderRadius: 7, border: '1px solid rgba(245,158,11,.25)', background: 'rgba(245,158,11,.06)', color: '#F59E0B', cursor: 'pointer', transition: 'all .15s' }}>★</button>
                                            )}
                                            <button onClick={() => del(u.id, `${u.prenom} ${u.nom}`)} disabled={!!busy} title="Supprimer"
                                                style={{ fontSize: 11, padding: '4px 10px', borderRadius: 7, border: '1px solid rgba(239,68,68,.25)', background: 'rgba(239,68,68,.06)', color: '#EF4444', cursor: 'pointer', transition: 'all .15s' }}>
                                                {busy === u.id + 'd' ? '…' : '✕'}
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>

                {/* Footer table */}
                {!loading && data.users.length > 0 && (
                    <div style={{ padding: '12px 16px', borderTop: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: 11, color: '#334155' }}>
                            Affichage {(page - 1) * 20 + 1}–{Math.min(page * 20, data.total)} sur {data.total}
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