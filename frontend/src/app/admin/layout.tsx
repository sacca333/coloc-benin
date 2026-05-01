'use client';
import { useEffect, useState, useRef, useCallback } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/lib/api';

const TIMEOUT_MS = 15 * 60 * 1000; // 15 minutes d'inactivité

const nav = [
  { href: '/admin', label: "Vue d'ensemble", icon: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} style={{width:20,height:20}}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
    </svg>
  )},
  { href: '/admin/utilisateurs', label: 'Utilisateurs', icon: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} style={{width:20,height:20}}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  )},
  { href: '/admin/annonces', label: 'Annonces', icon: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} style={{width:20,height:20}}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
    </svg>
  )},
  { href: '/admin/abonnements', label: 'Abonnements', icon: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} style={{width:20,height:20}}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
    </svg>
  )},
  { href: '/admin/statistiques', label: 'Statistiques', icon: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} style={{width:20,height:20}}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
    </svg>
  )},
  { href: '/admin/villes', label: 'Villes', icon: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} style={{width:20,height:20}}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  )},
];

interface AdminNotif {
  id: string;
  type: 'ECHEC_PAIEMENT' | 'SIGNALEMENT';
  message: string;
  date: string;
  lu: boolean;
  lien: string;
}

interface SearchResult {
  type: 'utilisateur' | 'annonce' | 'abonnement';
  id: string;
  label: string;
  sub: string;
  lien: string;
  icon: string;
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [ok, setOk] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Notifications
  const [notifs, setNotifs] = useState<AdminNotif[]>([]);
  const [notifOpen, setNotifOpen] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);
  const nonLues = notifs.filter(n => !n.lu).length;

  // Recherche globale
  const [searchQ, setSearchQ] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const searchTimer = useRef<any>(null);

  // Session timeout
  const [countdown, setCountdown] = useState(0);
  const [showWarning, setShowWarning] = useState(false);
  const timeoutRef = useRef<any>(null);
  const warningRef = useRef<any>(null);
  const countdownRef = useRef<any>(null);

  // ── Auth ──
  useEffect(() => {
    api.get('/auth/me').then(r => {
      if ((r.data as any).typeCompte !== 'ADMIN') router.push('/dashboard');
      else { setUser(r.data); setOk(true); }
    }).catch(() => router.push('/auth/login'));
  }, []);

  useEffect(() => { setSidebarOpen(false); setNotifOpen(false); setSearchOpen(false); setSearchQ(''); }, [pathname]);

  // ── Session timeout ──
  const doLogout = useCallback(() => {
    localStorage.removeItem('coloc_token');
    router.push('/auth/login?reason=timeout');
  }, [router]);

  const resetTimer = useCallback(() => {
    setShowWarning(false);
    clearTimeout(timeoutRef.current);
    clearTimeout(warningRef.current);
    clearInterval(countdownRef.current);

    // Avertissement 2 minutes avant
    warningRef.current = setTimeout(() => {
      setShowWarning(true);
      setCountdown(120);
      countdownRef.current = setInterval(() => {
        setCountdown(c => {
          if (c <= 1) { clearInterval(countdownRef.current); return 0; }
          return c - 1;
        });
      }, 1000);
    }, TIMEOUT_MS - 2 * 60 * 1000);

    timeoutRef.current = setTimeout(doLogout, TIMEOUT_MS);
  }, [doLogout]);

  useEffect(() => {
    if (!ok) return;
    const events = ['mousemove', 'mousedown', 'keydown', 'scroll', 'touchstart'];
    events.forEach(e => window.addEventListener(e, resetTimer, { passive: true }));
    resetTimer();
    return () => {
      events.forEach(e => window.removeEventListener(e, resetTimer));
      clearTimeout(timeoutRef.current);
      clearTimeout(warningRef.current);
      clearInterval(countdownRef.current);
    };
  }, [ok, resetTimer]);

  // ── Notifications polling ──
  const fetchNotifs = useCallback(async () => {
    const nouvelles: AdminNotif[] = [];
    try {
      const r = await api.get('/admin/abonnements', { params: { statut: 'ECHEC', limit: 10, page: 1 } });
      (r.data.abonnements || []).forEach((a: any) => {
        nouvelles.push({
          id: 'echec-' + a.id,
          type: 'ECHEC_PAIEMENT',
          message: `Paiement échoué — ${a.utilisateur?.prenom} ${a.utilisateur?.nom} (${(a.montant || 0).toLocaleString()} F via ${a.operateur})`,
          date: a.createdAt || new Date().toISOString(),
          lu: false,
          lien: '/admin/abonnements',
        });
      });
    } catch {}
    setNotifs(prev => {
      const ids = new Set(prev.map(n => n.id));
      const merged = [...prev];
      nouvelles.forEach(n => { if (!ids.has(n.id)) merged.unshift(n); });
      return merged.slice(0, 20);
    });
  }, []);

  useEffect(() => {
    if (!ok) return;
    fetchNotifs();
    const i = setInterval(fetchNotifs, 30000);
    return () => clearInterval(i);
  }, [ok, fetchNotifs]);

  // ── Recherche globale ──
  useEffect(() => {
    clearTimeout(searchTimer.current);
    if (!searchQ.trim() || searchQ.length < 2) { setSearchResults([]); setSearchOpen(false); return; }
    searchTimer.current = setTimeout(async () => {
      setSearchLoading(true);
      setSearchOpen(true);
      const results: SearchResult[] = [];
      try {
        const [u, a, ab] = await Promise.allSettled([
          api.get('/admin/utilisateurs', { params: { search: searchQ, limit: 4, page: 1 } }),
          api.get('/admin/annonces',     { params: { search: searchQ, limit: 4, page: 1 } }),
          api.get('/admin/abonnements',  { params: { limit: 4, page: 1 } }),
        ]);
        if (u.status === 'fulfilled') {
          (u.value.data.users || []).forEach((x: any) => results.push({
            type: 'utilisateur', id: x.id,
            label: `${x.prenom} ${x.nom}`,
            sub: x.email,
            lien: '/admin/utilisateurs',
            icon: '👤',
          }));
        }
        if (a.status === 'fulfilled') {
          (a.value.data.annonces || []).forEach((x: any) => results.push({
            type: 'annonce', id: x.id,
            label: `${x.ville}${x.quartier ? ', ' + x.quartier : ''}`,
            sub: `${(x.loyerTotal || 0).toLocaleString()} F · ${x.statut}`,
            lien: '/admin/annonces',
            icon: '🏘️',
          }));
        }
        if (ab.status === 'fulfilled') {
          (ab.value.data.abonnements || [])
            .filter((x: any) => `${x.utilisateur?.prenom} ${x.utilisateur?.nom} ${x.utilisateur?.email}`.toLowerCase().includes(searchQ.toLowerCase()))
            .slice(0, 4)
            .forEach((x: any) => results.push({
              type: 'abonnement', id: x.id,
              label: `${x.utilisateur?.prenom} ${x.utilisateur?.nom}`,
              sub: `${(x.montant || 0).toLocaleString()} F · ${x.statut} · ${x.operateur}`,
              lien: '/admin/abonnements',
              icon: '💳',
            }));
        }
      } catch {}
      setSearchResults(results);
      setSearchLoading(false);
    }, 350);
  }, [searchQ]);

  // Fermer dropdowns au clic extérieur
  useEffect(() => {
    function handle(e: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) setNotifOpen(false);
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) setSearchOpen(false);
    }
    document.addEventListener('mousedown', handle);
    return () => document.removeEventListener('mousedown', handle);
  }, []);

  const marquerToutLu = () => setNotifs(p => p.map(n => ({ ...n, lu: true })));
  const marquerLu = (id: string) => setNotifs(p => p.map(n => n.id === id ? { ...n, lu: true } : n));

  function tempsRelatif(date: string) {
    const diff = (Date.now() - new Date(date).getTime()) / 1000;
    if (diff < 60) return 'à l\'instant';
    if (diff < 3600) return `il y a ${Math.floor(diff / 60)} min`;
    if (diff < 86400) return `il y a ${Math.floor(diff / 3600)}h`;
    return `il y a ${Math.floor(diff / 86400)}j`;
  }

  if (!ok) return (
    <div style={{ minHeight: '100vh', background: '#0c4a6e', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ width: 40, height: 40, border: '3px solid #38bdf8', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );

  return (
    <div className="admin-root">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;500;600;700;800&display=swap');
        *, *::before, *::after { box-sizing: border-box; }
        @keyframes spin    { to { transform: rotate(360deg) } }
        @keyframes fadeUp  { from { opacity:0; transform:translateY(10px) } to { opacity:1; transform:translateY(0) } }
        @keyframes slideIn { from { transform:translateX(-100%) } to { transform:translateX(0) } }
        @keyframes drop    { from { opacity:0; transform:translateY(-8px) } to { opacity:1; transform:translateY(0) } }
        @keyframes pulse   { 0%,100%{opacity:1} 50%{opacity:.5} }

        .admin-root    { display:flex; min-height:100vh; background:#f0f9ff; font-family:'Syne',sans-serif; }
        .admin-sidebar { width:240px; background:#0c4a6e; display:flex; flex-direction:column; padding:24px 12px; position:sticky; top:0; height:100vh; flex-shrink:0; z-index:40; }
        .admin-right   { flex:1; display:flex; flex-direction:column; min-width:0; }

        /* Topbar (recherche + cloche desktop) */
        .admin-topbar-inner {
          display: flex; align-items: center; gap: 12px;
          padding: 12px 36px; background: #fff;
          border-bottom: 1px solid #e0f2fe;
          position: sticky; top: 0; z-index: 30;
        }
        .admin-main    { flex:1; padding:28px 36px; overflow-x:hidden; animation:fadeUp .3s ease; }
        .admin-topbar-mobile { display:none; align-items:center; justify-content:space-between; position:sticky; top:0; z-index:40; background:#0c4a6e; padding:0 16px; height:56px; flex-shrink:0; }
        .admin-overlay { display:none; position:fixed; inset:0; background:rgba(0,0,0,0.5); z-index:45; }

        .anav { display:flex; align-items:center; gap:12px; padding:10px 14px; border-radius:12px; color:#bae6fd; text-decoration:none; font-size:14px; font-weight:500; transition:all .2s; }
        .anav:hover { background:rgba(255,255,255,0.1); color:#fff; }
        .anav.on    { background:#075985; color:#fff; box-shadow:0 2px 8px rgba(0,0,0,0.2); }

        /* Recherche */
        .search-wrap  { position:relative; flex:1; max-width:480px; }
        .search-input { width:100%; background:#f0f9ff; border:1px solid #bae6fd; border-radius:12px; padding:9px 14px 9px 38px; color:#0c4a6e; font-size:13px; outline:none; font-family:'Syne',sans-serif; transition:border-color .2s, box-shadow .2s; }
        .search-input:focus { border-color:#0284c7; box-shadow:0 0 0 3px rgba(2,132,199,0.12); background:#fff; }
        .search-icon  { position:absolute; left:12px; top:50%; transform:translateY(-50%); color:#94a3b8; pointer-events:none; }
        .search-drop  { position:absolute; top:calc(100% + 6px); left:0; right:0; background:#fff; border:1px solid #e0f2fe; border-radius:14px; box-shadow:0 8px 32px rgba(0,0,0,0.12); z-index:100; overflow:hidden; animation:drop .2s ease; max-height:420px; overflow-y:auto; }
        .search-item  { display:flex; align-items:center; gap:10px; padding:10px 14px; cursor:pointer; transition:background .15s; border-bottom:1px solid #f0f9ff; }
        .search-item:hover { background:#f0f9ff; }
        .search-item:last-child { border-bottom:none; }
        .search-section { padding:6px 14px 4px; font-size:9px; color:#94a3b8; letter-spacing:2px; text-transform:uppercase; font-weight:700; background:#f8fafc; }

        /* Notifs */
        .notif-panel { position:absolute; right:0; top:calc(100% + 8px); width:320px; background:#fff; border:1px solid #e0f2fe; border-radius:16px; box-shadow:0 8px 32px rgba(0,0,0,0.12); z-index:100; overflow:hidden; animation:drop .2s ease; max-height:380px; display:flex; flex-direction:column; }
        .notif-item   { display:flex; align-items:flex-start; gap:10px; padding:12px 14px; border-bottom:1px solid #f0f9ff; cursor:pointer; transition:background .15s; }
        .notif-item:hover { background:#f0f9ff; }
        .notif-item:last-child { border-bottom:none; }

        /* Warning timeout */
        .timeout-warning { position:fixed; bottom:24px; left:50%; transform:translateX(-50%); background:#fff; border:2px solid #f59e0b; border-radius:16px; padding:16px 24px; box-shadow:0 8px 32px rgba(0,0,0,0.15); z-index:9999; display:flex; align-items:center; gap:14px; font-family:'Syne',sans-serif; animation:drop .3s ease; min-width:360px; }

        @media(max-width:768px) {
          .admin-sidebar { position:fixed; top:0; left:0; height:100vh; transform:translateX(-100%); transition:transform 0.3s ease; z-index:50; }
          .admin-sidebar.open { transform:translateX(0); }
          .admin-overlay.open { display:block; }
          .admin-topbar-inner { display:none; }
          .admin-topbar-mobile { display:flex; }
          .admin-main { padding:20px 16px; }
          .timeout-warning { min-width:calc(100vw - 32px); }
        }
        @media(min-width:769px) and (max-width:1024px) {
          .admin-sidebar { width:200px; }
          .admin-main { padding:24px 24px; }
          .admin-topbar-inner { padding:12px 24px; }
        }
      `}</style>

      {/* ── Warning session ── */}
      {showWarning && (
        <div className="timeout-warning">
          <div style={{ fontSize: 28 }}>⏱️</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: '#92400e' }}>Session expirée dans {countdown}s</div>
            <div style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>Vous allez être déconnecté pour inactivité.</div>
          </div>
          <button onClick={resetTimer}
            style={{ background: '#f59e0b', border: 'none', borderRadius: 10, padding: '8px 16px', color: '#fff', fontWeight: 700, fontSize: 12, cursor: 'pointer', fontFamily: 'Syne,sans-serif', flexShrink: 0 }}>
            Rester connecté
          </button>
        </div>
      )}

      <div className={`admin-overlay${sidebarOpen ? ' open' : ''}`} onClick={() => setSidebarOpen(false)} />

      {/* ── Sidebar ── */}
      <aside className={`admin-sidebar${sidebarOpen ? ' open' : ''}`}>
        <div style={{ padding: '0 4px', marginBottom: 32 }}>
          <Link href="/dashboard" style={{ display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none' }}>
            <img src="/logo.png" alt="logo" style={{ width: 32, height: 32, borderRadius: 10, objectFit: 'cover' }} />
            <span style={{ fontWeight: 800, fontSize: 16 }}>
              <span style={{ color: '#4ade80' }}>Coloc</span>
              <span style={{ color: '#fde047' }}>Bénin</span>
            </span>
          </Link>
          <div style={{ fontSize: 9, color: '#7dd3fc', letterSpacing: '2px', textTransform: 'uppercase', marginTop: 4, paddingLeft: 40 }}>Admin Panel</div>
        </div>

        <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
          {nav.map(n => {
            const active = pathname === n.href || (n.href !== '/admin' && pathname.startsWith(n.href));
            return (
              <Link key={n.href} href={n.href} className={`anav${active ? ' on' : ''}`}>
                {n.icon}<span>{n.label}</span>
              </Link>
            );
          })}
        </nav>

        <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: 12, display: 'flex', flexDirection: 'column', gap: 2 }}>
          {user && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 14px', marginBottom: 4 }}>
              <div style={{ width: 30, height: 30, borderRadius: '50%', background: 'linear-gradient(135deg,#4ade80,#3b82f6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, color: '#fff', flexShrink: 0 }}>
                {user.prenom?.[0]}{user.nom?.[0]}
              </div>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: '#fff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user.prenom} {user.nom}</div>
                <div style={{ fontSize: 10, color: '#7dd3fc' }}>Administrateur</div>
              </div>
            </div>
          )}
          <Link href="/dashboard" className="anav" style={{ fontSize: 13 }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} style={{width:18,height:18}}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Retour app
          </Link>
          <button onClick={() => { localStorage.removeItem('coloc_token'); router.push('/auth/login'); }} className="anav"
            style={{ fontSize: 13, color: '#fca5a5', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left', width: '100%' }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} style={{width:18,height:18}}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Déconnexion
          </button>
        </div>
      </aside>

      {/* ── Contenu droit ── */}
      <div className="admin-right">

        {/* Topbar mobile */}
        <div className="admin-topbar-mobile">
          <button onClick={() => setSidebarOpen(true)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 6 }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="#bae6fd" strokeWidth={2} style={{width:22,height:22}}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <span style={{ fontWeight: 700, fontSize: 14 }}>
            <span style={{ color: '#4ade80' }}>Coloc</span>
            <span style={{ color: '#fde047' }}>Bénin</span>
            <span style={{ color: '#7dd3fc', fontSize: 11, marginLeft: 6 }}>Admin</span>
          </span>
          {/* Cloche mobile */}
          <button onClick={() => setNotifOpen(o => !o)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 6, position: 'relative' }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="#bae6fd" strokeWidth={2} style={{width:22,height:22}}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
            {nonLues > 0 && (
              <span style={{ position: 'absolute', top: 2, right: 2, background: '#dc2626', color: '#fff', fontSize: 9, fontWeight: 700, borderRadius: '50%', width: 15, height: 15, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {nonLues > 9 ? '9+' : nonLues}
              </span>
            )}
          </button>
          {/* Dropdown notifs mobile */}
          {notifOpen && (
            <div ref={notifRef} style={{ position: 'fixed', top: 56, right: 12, left: 12, background: '#fff', border: '1px solid #e0f2fe', borderRadius: 16, boxShadow: '0 8px 32px rgba(0,0,0,0.15)', zIndex: 100, overflow: 'hidden', maxHeight: 380, display: 'flex', flexDirection: 'column', animation: 'drop .2s ease' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 14px', borderBottom: '1px solid #e0f2fe', background: '#f0f9ff' }}>
                <span style={{ fontSize: 12, fontWeight: 700, color: '#0c4a6e' }}>Alertes admin</span>
                {nonLues > 0 && (
                  <button onClick={marquerToutLu} style={{ fontSize: 11, color: '#0284c7', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'Syne,sans-serif' }}>Tout marquer lu</button>
                )}
              </div>
              <div style={{ overflowY: 'auto', flex: 1 }}>
                {notifs.length === 0 ? (
                  <div style={{ padding: '32px 16px', textAlign: 'center', color: '#64748b' }}>
                    <div style={{ fontSize: 28, marginBottom: 8 }}>🔔</div>
                    <div style={{ fontSize: 12 }}>Aucune alerte</div>
                  </div>
                ) : notifs.map(n => (
                  <div key={n.id} className="notif-item" style={{ background: n.lu ? '#fff' : '#eff6ff' }}
                    onClick={() => { marquerLu(n.id); setNotifOpen(false); router.push(n.lien); }}>
                    <div style={{ width: 32, height: 32, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, flexShrink: 0, background: n.type === 'ECHEC_PAIEMENT' ? '#fee2e2' : '#fef3c7' }}>
                      {n.type === 'ECHEC_PAIEMENT' ? '💳' : '🚩'}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 11, fontWeight: 600, color: '#0c4a6e', lineHeight: 1.4 }}>{n.message}</div>
                      <div style={{ fontSize: 10, color: '#94a3b8', marginTop: 3 }}>{tempsRelatif(n.date)}</div>
                    </div>
                    {!n.lu && <div style={{ width: 7, height: 7, borderRadius: '50%', background: '#0284c7', flexShrink: 0, marginTop: 4 }} />}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Topbar desktop : recherche + notifs */}
        <div className="admin-topbar-inner">

          {/* Recherche globale */}
          <div className="search-wrap" ref={searchRef}>
            <span className="search-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} style={{width:16,height:16}}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </span>
            <input
              className="search-input"
              value={searchQ}
              onChange={e => setSearchQ(e.target.value)}
              onFocus={() => { if (searchResults.length > 0) setSearchOpen(true); }}
              placeholder="Rechercher un utilisateur, une annonce, un abonnement..."
            />
            {searchOpen && (
              <div className="search-drop">
                {searchLoading ? (
                  <div style={{ padding: '20px', textAlign: 'center' }}>
                    <div style={{ width: 20, height: 20, border: '2px solid #0284c7', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin .7s linear infinite', margin: '0 auto' }} />
                  </div>
                ) : searchResults.length === 0 ? (
                  <div style={{ padding: '20px', textAlign: 'center', color: '#94a3b8', fontSize: 13 }}>Aucun résultat pour « {searchQ} »</div>
                ) : (
                  <>
                    {(['utilisateur','annonce','abonnement'] as const).map(type => {
                      const items = searchResults.filter(r => r.type === type);
                      if (!items.length) return null;
                      const labels: Record<string,string> = { utilisateur: 'Utilisateurs', annonce: 'Annonces', abonnement: 'Abonnements' };
                      return (
                        <div key={type}>
                          <div className="search-section">{labels[type]}</div>
                          {items.map(r => (
                            <div key={r.id} className="search-item" onClick={() => { router.push(r.lien); setSearchOpen(false); setSearchQ(''); }}>
                              <div style={{ width: 32, height: 32, borderRadius: 8, background: '#e0f2fe', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, flexShrink: 0 }}>{r.icon}</div>
                              <div style={{ minWidth: 0 }}>
                                <div style={{ fontSize: 13, fontWeight: 600, color: '#0c4a6e', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.label}</div>
                                <div style={{ fontSize: 11, color: '#64748b', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.sub}</div>
                              </div>
                              <svg viewBox="0 0 24 24" fill="none" stroke="#cbd5e1" strokeWidth={2} style={{width:14,height:14,flexShrink:0}}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                              </svg>
                            </div>
                          ))}
                        </div>
                      );
                    })}
                  </>
                )}
              </div>
            )}
          </div>

          <div style={{ flex: 1 }} />

          {/* Cloche notifs desktop */}
          <div style={{ position: 'relative' }} ref={notifRef}>
            <button onClick={() => setNotifOpen(o => !o)}
              style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 14px', borderRadius: 12, background: notifOpen ? '#e0f2fe' : '#f0f9ff', border: '1px solid #bae6fd', cursor: 'pointer', color: '#0369a1', transition: 'all .2s', position: 'relative' }}>
              <div style={{ position: 'relative' }}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} style={{width:18,height:18}}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
                {nonLues > 0 && (
                  <span style={{ position: 'absolute', top: -6, right: -6, background: '#dc2626', color: '#fff', fontSize: 9, fontWeight: 700, borderRadius: '50%', width: 15, height: 15, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {nonLues > 9 ? '9+' : nonLues}
                  </span>
                )}
              </div>
              <span style={{ fontSize: 13, fontWeight: 600 }}>Alertes</span>
              {nonLues > 0 && <span style={{ background: '#dc2626', color: '#fff', fontSize: 10, fontWeight: 700, borderRadius: 20, padding: '1px 6px' }}>{nonLues}</span>}
            </button>

            {notifOpen && (
              <div className="notif-panel">
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 14px', borderBottom: '1px solid #e0f2fe', background: '#f0f9ff' }}>
                  <span style={{ fontSize: 12, fontWeight: 700, color: '#0c4a6e' }}>Alertes admin</span>
                  {nonLues > 0 && (
                    <button onClick={marquerToutLu} style={{ fontSize: 11, color: '#0284c7', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'Syne,sans-serif' }}>Tout marquer lu</button>
                  )}
                </div>
                <div style={{ overflowY: 'auto', flex: 1 }}>
                  {notifs.length === 0 ? (
                    <div style={{ padding: '32px 16px', textAlign: 'center', color: '#64748b' }}>
                      <div style={{ fontSize: 28, marginBottom: 8 }}>🔔</div>
                      <div style={{ fontSize: 12 }}>Aucune alerte</div>
                    </div>
                  ) : notifs.map(n => (
                    <div key={n.id} className="notif-item" style={{ background: n.lu ? '#fff' : '#eff6ff' }}
                      onClick={() => { marquerLu(n.id); setNotifOpen(false); router.push(n.lien); }}>
                      <div style={{ width: 32, height: 32, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, flexShrink: 0, background: n.type === 'ECHEC_PAIEMENT' ? '#fee2e2' : '#fef3c7' }}>
                        {n.type === 'ECHEC_PAIEMENT' ? '💳' : '🚩'}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 11, fontWeight: 600, color: '#0c4a6e', lineHeight: 1.4 }}>{n.message}</div>
                        <div style={{ fontSize: 10, color: '#94a3b8', marginTop: 3 }}>{tempsRelatif(n.date)}</div>
                      </div>
                      {!n.lu && <div style={{ width: 7, height: 7, borderRadius: '50%', background: '#0284c7', flexShrink: 0, marginTop: 4 }} />}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        <main className="admin-main">{children}</main>
      </div>
    </div>
  );
}
