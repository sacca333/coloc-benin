'use client';
import { useEffect, useState, useCallback } from 'react';
import { api, photoUrl } from '@/lib/api';

const sC: Record<string, [string, string]> = {
    ACTIF: ['#10B981', 'rgba(16,185,129,.1)'],
    EXPIRE: ['#EF4444', 'rgba(239,68,68,.1)'],
    EN_ATTENTE: ['#F59E0B', 'rgba(245,158,11,.1)'],
    ECHEC: ['#6B7280', 'rgba(107,114,128,.1)'],
};

export default function AdminAbonnements() {
    const [data, setData] = useState<any>({ abonnements: [], total: 0, pages: 1 });
    const [page, setPage] = useState(1);
    const [statut, setStatut] = useState('');
    const [loading, setLoading] = useState(true);

    const load = useCallback(async () => {
        setLoading(true);
        try { const r = await api.get('/admin/abonnements', { params: { page, limit: 20, statut } }); setData(r.data); }
        finally { setLoading(false); }
    }, [page, statut]);

    useEffect(() => { load(); }, [load]);

    const setStatutAbo = async (id: string, s: string) => {
        try {
            await api.put(`/admin/abonnements/${id}/statut`, { statut: s });
            setData((d: any) => ({ ...d, abonnements: d.abonnements.map((a: any) => a.id === id ? { ...a, statut: s } : a) }));
        } catch { }
    };

    const exportCSV = () => { window.open(process.env.NEXT_PUBLIC_API_URL + '/admin/abonnements/export', '_blank'); };

    const revenusPage = data.abonnements.filter((a: any) => a.statut === 'ACTIF').reduce((s: number, a: any) => s + (a.montant || 0), 0);

    return (
        <div style={{ maxWidth: 1160, fontFamily: "'Syne',sans-serif" }}>
            <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
            <div style={{ marginBottom: 28 }}>
                <div style={{ fontSize: 10, color: '#10B981', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: 6 }}>Administration</div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                    <h1 style={{ fontSize: 30, fontWeight: 800, color: '#F1F5F9', margin: 0, letterSpacing: '-1px' }}>Abonnements</h1>
                    <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: 22, fontWeight: 800, color: '#F59E0B', fontFamily: "'JetBrains Mono',monospace" }}>{revenusPage.toLocaleString()} F</div>
                        <div style={{ fontSize: 10, color: '#475569' }}>revenus cette page</div>
                    </div>
                </div>
            </div>

            <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
                {Object.entries(sC).map(([s, [c, bg]]) => (
                    <button key={s} onClick={() => { setStatut(s === statut ? '' : s); setPage(1); }}
                        style={{ fontSize: 11, padding: '6px 14px', borderRadius: 20, border: '1px solid', borderColor: statut === s ? c : 'rgba(255,255,255,0.08)', background: statut === s ? bg : 'transparent', color: statut === s ? c : '#475569', cursor: 'pointer', fontWeight: 600, transition: 'all .2s' }}>
                        {s}
                    </button>
                ))}
                <div style={{ flex: 1 }} />
                <button onClick={exportCSV} style={{ fontSize: 11, padding: '6px 16px', borderRadius: 20, border: '1px solid rgba(16,185,129,.3)', background: 'rgba(16,185,129,.08)', color: '#10B981', cursor: 'pointer', fontWeight: 600 }}>
                    ↓ Export CSV
                </button>
            </div>

            <div style={{ background: '#080F1C', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 16, overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                            {['Utilisateur', 'Opérateur', 'Montant', 'Période', 'Statut', 'Actions'].map(h => (
                                <th key={h} style={{ padding: '12px 14px', textAlign: 'left', fontSize: 9, color: '#334155', letterSpacing: '1px', textTransform: 'uppercase', fontWeight: 600 }}>{h}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan={6} style={{ padding: 40, textAlign: 'center' }}>
                                <div style={{ width: 30, height: 30, border: '2px solid #10B981', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin .8s linear infinite', margin: '0 auto' }} />
                            </td></tr>
                        ) : data.abonnements.map((a: any) => {
                            const [c, bg] = sC[a.statut] || sC.ECHEC;
                            const fin = a.periodeFin ? new Date(a.periodeFin) : null;
                            const jours = fin ? Math.ceil((fin.getTime() - Date.now()) / 86400000) : 0;
                            return (
                                <tr key={a.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', transition: 'background .15s' }}
                                    onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.02)')}
                                    onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
                                    <td style={{ padding: '10px 14px' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
                                            {a.utilisateur?.photo ? <img src={a.utilisateur?.photo ? photoUrl(a.utilisateur.photo) as string : undefined} alt="" style={{ width: 34, height: 34, borderRadius: '50%', objectFit: 'cover' }} /> : (
                                                <div style={{ width: 34, height: 34, borderRadius: '50%', background: 'linear-gradient(135deg,#10B981,#3B82F6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, color: '#fff' }}>
                                                    {a.utilisateur?.prenom?.[0]}{a.utilisateur?.nom?.[0]}
                                                </div>
                                            )}
                                            <div>
                                                <div style={{ fontSize: 12, fontWeight: 600, color: '#E2E8F0' }}>{a.utilisateur?.prenom} {a.utilisateur?.nom}</div>
                                                <div style={{ fontSize: 10, color: '#475569' }}>{a.utilisateur?.email}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td style={{ padding: '10px 14px', fontSize: 12, color: '#CBD5E1' }}>
                                        {a.operateur === 'MOMO' ? '📱' : a.operateur === 'CCASH' ? '💳' : '📲'} {a.operateur}
                                    </td>
                                    <td style={{ padding: '10px 14px', fontSize: 14, fontWeight: 800, color: '#F59E0B', fontFamily: "'JetBrains Mono',monospace" }}>{(a.montant || 0).toLocaleString()} F</td>
                                    <td style={{ padding: '10px 14px' }}>
                                        <div style={{ fontSize: 11, color: '#CBD5E1' }}>
                                            {a.periodeDebut ? new Date(a.periodeDebut).toLocaleDateString('fr-FR') : '—'} → {fin ? fin.toLocaleDateString('fr-FR') : '—'}
                                        </div>
                                        {a.statut === 'ACTIF' && (
                                            <div style={{ fontSize: 10, color: jours <= 7 ? '#EF4444' : jours <= 15 ? '#F59E0B' : '#10B981' }}>
                                                {jours > 0 ? `${jours}j restants` : 'Expiré'}
                                            </div>
                                        )}
                                    </td>
                                    <td style={{ padding: '10px 14px' }}>
                                        <span style={{ fontSize: 10, fontWeight: 600, color: c, background: bg, padding: '2px 9px', borderRadius: 20 }}>{a.statut}</span>
                                    </td>
                                    <td style={{ padding: '10px 14px' }}>
                                        <div style={{ display: 'flex', gap: 5 }}>
                                            {a.statut !== 'ACTIF' && (
                                                <button onClick={() => setStatutAbo(a.id, 'ACTIF')} style={{ fontSize: 10, padding: '3px 9px', borderRadius: 6, border: '1px solid rgba(16,185,129,.3)', background: 'transparent', color: '#10B981', cursor: 'pointer' }}>Activer</button>
                                            )}
                                            {a.statut === 'ACTIF' && (
                                                <button onClick={() => setStatutAbo(a.id, 'EXPIRE')} style={{ fontSize: 10, padding: '3px 9px', borderRadius: 6, border: '1px solid rgba(239,68,68,.3)', background: 'transparent', color: '#EF4444', cursor: 'pointer' }}>Expirer</button>
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