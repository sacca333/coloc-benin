'use client';
import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/lib/api';

const nav = [
    { href: '/admin', label: 'Vue d\'ensemble', icon: '◈' },
    { href: '/admin/utilisateurs', label: 'Utilisateurs', icon: '◎' },
    { href: '/admin/annonces', label: 'Annonces', icon: '◰' },
    { href: '/admin/abonnements', label: 'Abonnements', icon: '◍' },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    const pathname = usePathname();
    const [ok, setOk] = useState(false);

    useEffect(() => {
        api.get('/auth/me').then(r => {
            if (r.data.typeCompte !== 'ADMIN') router.push('/dashboard');
            else setOk(true);
        }).catch(() => router.push('/auth/login'));
    }, []);

    if (!ok) return (
        <div style={{ minHeight: '100vh', background: '#050A14', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ width: 40, height: 40, border: '2px solid #10B981', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
            <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
        </div>
    );

    return (
        <div style={{ display: 'flex', minHeight: '100vh', background: '#050A14', fontFamily: "'Syne', sans-serif" }}>
            <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500&display=swap');
        @keyframes spin{to{transform:rotate(360deg)}}
        @keyframes fadeUp{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}
        .anav{display:flex;align-items:center;gap:10px;padding:9px 14px;border-radius:10px;color:#64748B;text-decoration:none;font-size:13px;font-weight:500;transition:all .2s;border:1px solid transparent}
        .anav:hover{background:rgba(16,185,129,.08);color:#10B981;border-color:rgba(16,185,129,.15)}
        .anav.on{background:rgba(16,185,129,.12);color:#10B981;border-color:rgba(16,185,129,.25)}
        .ac{animation:fadeUp .35s ease}
      `}</style>

            <aside style={{ width: 228, background: '#080F1C', borderRight: '1px solid rgba(255,255,255,0.05)', display: 'flex', flexDirection: 'column', padding: '24px 14px', position: 'sticky', top: 0, height: '100vh', flexShrink: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 36 }}>
                    <div style={{ width: 32, height: 32, background: 'linear-gradient(135deg,#10B981,#059669)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15 }}>🏠</div>
                    <div>
                        <div style={{ fontSize: 14, fontWeight: 800, color: '#F1F5F9' }}><span style={{ color: '#10B981' }}>Coloc</span>Bénin</div>
                        <div style={{ fontSize: 9, color: '#334155', letterSpacing: '2px', textTransform: 'uppercase' }}>Admin Panel</div>
                    </div>
                </div>

                <div style={{ fontSize: 9, color: '#1E293B', letterSpacing: '2px', textTransform: 'uppercase', paddingLeft: 14, marginBottom: 8 }}>Menu</div>
                <nav style={{ display: 'flex', flexDirection: 'column', gap: 3, flex: 1 }}>
                    {nav.map(n => (
                        <Link key={n.href} href={n.href} className={`anav${pathname === n.href ? ' on' : ''}`}>
                            <span style={{ fontSize: 15 }}>{n.icon}</span>{n.label}
                        </Link>
                    ))}
                </nav>

                <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: 14 }}>
                    <Link href="/dashboard" className="anav" style={{ fontSize: 12, color: '#334155' }}>← Retour app</Link>
                </div>
            </aside>

            <main style={{ flex: 1, overflow: 'auto', padding: '36px 40px' }} className="ac">{children}</main>
        </div>
    );
}