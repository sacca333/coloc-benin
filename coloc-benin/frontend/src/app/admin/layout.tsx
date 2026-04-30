'use client';
import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/lib/api';

const nav = [
    { href: '/admin', label: "Vue d'ensemble", icon: '◈', exact: true },
    { href: '/admin/utilisateurs', label: 'Utilisateurs', icon: '◎' },
    { href: '/admin/annonces', label: 'Annonces', icon: '◰' },
    { href: '/admin/abonnements', label: 'Abonnements', icon: '◍' },
];

export function Toast({ message, type, onClose }: { message: string; type: 'success' | 'error'; onClose: () => void }) {
    useEffect(() => { const t = setTimeout(onClose, 3000); return () => clearTimeout(t); }, []);
    return (
        <div style={{ position: 'fixed', bottom: 24, right: 24, zIndex: 9999, background: type === 'success' ? '#064E3B' : '#450A0A', border: `1px solid ${type === 'success' ? '#10B981' : '#EF4444'}`, borderRadius: 12, padding: '12px 18px', display: 'flex', alignItems: 'center', gap: 10, boxShadow: '0 8px 32px rgba(0,0,0,0.4)', animation: 'slideUp .3s ease', fontFamily: "'Syne',sans-serif" }}>
            <span>{type === 'success' ? '✓' : '✕'}</span>
            <span style={{ fontSize: 13, color: '#F1F5F9' }}>{message}</span>
            <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#475569', cursor: 'pointer', marginLeft: 8 }}>×</button>
        </div>
    );
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    const pathname = usePathname();
    const [ok, setOk] = useState(false);
    const [user, setUser] = useState<any>(null);
    const [collapsed, setCollapsed] = useState(false);

    useEffect(() => {
        api.get('/auth/me').then(r => {
            if (r.data.typeCompte !== 'ADMIN') router.push('/dashboard');
            else { setUser(r.data); setOk(true); }
        }).catch(() => router.push('/auth/login'));
    }, []);

    if (!ok) return (
        <div style={{ minHeight: '100vh', background: '#050A14', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <style>{`@keyframes spin{to{transform:rotate(360deg)}} @keyframes pulse{0%,100%{opacity:1}50%{opacity:.5}}`}</style>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
                <div style={{ width: 44, height: 44, border: '2px solid #10B981', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
                <span style={{ color: '#334155', fontSize: 13, fontFamily: "'Syne',sans-serif" }}>Vérification des accès…</span>
            </div>
        </div>
    );

    const w = collapsed ? 72 : 228;

    return (
        <div style={{ display: 'flex', minHeight: '100vh', background: '#050A14', fontFamily: "'Syne', sans-serif" }}>
            <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500&display=swap');
        @keyframes spin{to{transform:rotate(360deg)}}
        @keyframes fadeUp{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}
        @keyframes slideUp{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}
        @keyframes shimmer{0%{background-position:-200% 0}100%{background-position:200% 0}}
        .anav{display:flex;align-items:center;gap:10px;padding:9px 12px;border-radius:10px;color:#475569;text-decoration:none;font-size:13px;font-weight:500;transition:all .2s;border:1px solid transparent;white-space:nowrap;overflow:hidden}
        .anav:hover{background:rgba(16,185,129,.08);color:#10B981;border-color:rgba(16,185,129,.15)}
        .anav.on{background:rgba(16,185,129,.12);color:#10B981;border-color:rgba(16,185,129,.25)}
        .anav .icon{flex-shrink:0;font-size:16px;width:20px;text-align:center}
        .ac{animation:fadeUp .35s ease}
        .btn-action{border:none;cursor:pointer;transition:all .2s;font-family:'Syne',sans-serif}
        .btn-action:hover{opacity:.85;transform:translateY(-1px)}
        .btn-action:active{transform:translateY(0)}
        ::-webkit-scrollbar{width:4px}::-webkit-scrollbar-track{background:transparent}::-webkit-scrollbar-thumb{background:#1E293B;border-radius:2px}
      `}</style>

            {/* Sidebar */}
            <aside style={{ width: w, background: '#080F1C', borderRight: '1px solid rgba(255,255,255,0.05)', display: 'flex', flexDirection: 'column', padding: '20px 10px', position: 'sticky', top: 0, height: '100vh', flexShrink: 0, transition: 'width .25s ease', overflow: 'hidden' }}>

                {/* Logo + collapse */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28, paddingLeft: 4 }}>
                    {!collapsed && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <div style={{ width: 30, height: 30, background: 'linear-gradient(135deg,#10B981,#059669)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, flexShrink: 0 }}>🏠</div>
                            <div>
                                <div style={{ fontSize: 13, fontWeight: 800, color: '#F1F5F9' }}><span style={{ color: '#10B981' }}>Coloc</span>Bénin</div>
                                <div style={{ fontSize: 8, color: '#334155', letterSpacing: '2px', textTransform: 'uppercase' }}>Admin</div>
                            </div>
                        </div>
                    )}
                    {collapsed && <div style={{ width: 30, height: 30, background: 'linear-gradient(135deg,#10B981,#059669)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, margin: '0 auto' }}>🏠</div>}
                    {!collapsed && (
                        <button onClick={() => setCollapsed(true)} style={{ background: 'none', border: 'none', color: '#334155', cursor: 'pointer', fontSize: 16, padding: 4 }}>‹</button>
                    )}
                </div>

                {collapsed && (
                    <button onClick={() => setCollapsed(false)} style={{ background: 'none', border: 'none', color: '#334155', cursor: 'pointer', fontSize: 16, padding: 4, textAlign: 'center', marginBottom: 12 }}>›</button>
                )}

                {!collapsed && <div style={{ fontSize: 9, color: '#1E293B', letterSpacing: '2px', textTransform: 'uppercase', paddingLeft: 12, marginBottom: 6 }}>Navigation</div>}

                <nav style={{ display: 'flex', flexDirection: 'column', gap: 2, flex: 1 }}>
                    {nav.map(n => {
                        const active = n.exact ? pathname === n.href : pathname.startsWith(n.href);
                        return (
                            <Link key={n.href} href={n.href} className={`anav${active ? ' on' : ''}`} title={collapsed ? n.label : ''}>
                                <span className="icon">{n.icon}</span>
                                {!collapsed && n.label}
                            </Link>
                        );
                    })}
                </nav>

                {/* User info */}
                {user && (
                    <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: 14, marginTop: 8 }}>
                        {!collapsed && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px', borderRadius: 10, background: 'rgba(255,255,255,0.03)', marginBottom: 8 }}>
                                <div style={{ width: 30, height: 30, borderRadius: '50%', background: 'linear-gradient(135deg,#10B981,#3B82F6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 800, color: '#fff', flexShrink: 0 }}>
                                    {user.prenom?.[0]}{user.nom?.[0]}
                                </div>
                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <div style={{ fontSize: 11, fontWeight: 600, color: '#E2E8F0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user.prenom} {user.nom}</div>
                                    <div style={{ fontSize: 9, color: '#10B981', letterSpacing: '1px', textTransform: 'uppercase' }}>Admin</div>
                                </div>
                            </div>
                        )}
                        <Link href="/dashboard" className="anav" style={{ fontSize: 11, color: '#334155', justifyContent: collapsed ? 'center' : 'flex-start' }} title="Retour app">
                            <span className="icon">←</span>
                            {!collapsed && 'Retour app'}
                        </Link>
                    </div>
                )}
            </aside>

            <main style={{ flex: 1, overflow: 'auto', padding: '32px 36px', minHeight: '100vh' }} className="ac">
                {children}
            </main>
        </div>
    );
}