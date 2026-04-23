'use client';
import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '../../hooks/useAuth';
import { photoUrl, notificationsApi } from '../../lib/api';
import { Notification } from '../../types';
import clsx from 'clsx';

const NAV_LINKS = [
  {
    href: '/dashboard',
    label: 'Tableau de bord',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="w-5 h-5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
      </svg>
    ),
  },
  {
    href: '/annonces',
    label: 'Annonces',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="w-5 h-5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
      </svg>
    ),
  },
  {
    href: '/mes-annonces',
    label: 'Mes annonces',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="w-5 h-5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
      </svg>
    ),
  },
  {
    href: '/messagerie',
    label: 'Messagerie',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="w-5 h-5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
      </svg>
    ),
  },
  {
    href: '/colocations',
    label: 'Mes colocations',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="w-5 h-5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
      </svg>
    ),
  },
];

function tempsRelatif(date: string) {
  const diff = (Date.now() - new Date(date).getTime()) / 1000;
  if (diff < 60) return 'il y a quelques secondes';
  if (diff < 3600) return `il y a ${Math.floor(diff / 60)} min`;
  if (diff < 86400) return `il y a ${Math.floor(diff / 3600)}h`;
  return `il y a ${Math.floor(diff / 86400)}j`;
}

function lienNotification(notif: Notification): string {
  const data = notif.data as any;
  if (notif.type === 'NOUVELLE_ANNONCE' && data?.annonceId) return `/annonces/${data.annonceId}`;
  if (notif.type === 'DEMANDE_COLOCATION' && data?.expediteurId) return `/messagerie/${data.expediteurId}`;
  if (notif.type === 'COLOCATION_ACCEPTEE' && data?.colocationId) return `/colocations/${data.colocationId}`;
  return '/annonces';
}

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, abonnementActif, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [clochOpen, setClochOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [nonLues, setNonLues] = useState(0);
  const profileRef = useRef<HTMLDivElement>(null);
  const clochRef = useRef<HTMLDivElement>(null);

  const userPhoto = photoUrl(user?.photo);
  const isPublicPage = !user || pathname.startsWith('/auth');
  const isAnnoncesPage = pathname.startsWith('/annonces');

  // Charger notifications
  const chargerNotifications = async () => {
    if (!user || !isAnnoncesPage) return;
    try {
      const [notifRes, countRes] = await Promise.all([
        notificationsApi.toutes(),
        notificationsApi.nonLuesCount(),
      ]);
      setNotifications(notifRes.data.slice(0, 5));
      setNonLues(countRes.data.count);
    } catch {}
  };

  useEffect(() => {
    chargerNotifications();
    const interval = setInterval(chargerNotifications, 30000);
    return () => clearInterval(interval);
  }, [user, pathname]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) setProfileOpen(false);
      if (clochRef.current && !clochRef.current.contains(e.target as Node)) setClochOpen(false);
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleClochClick = () => {
    setClochOpen(!clochOpen);
    if (!clochOpen && nonLues > 0) chargerNotifications();
  };

  const handleToutMarquerLu = async () => {
    try {
      await notificationsApi.toutMarquerLu();
      setNonLues(0);
      setNotifications(prev => prev.map(n => ({ ...n, lu: true })));
    } catch {}
  };

  const handleNotifClick = async (notif: Notification) => {
    try { await notificationsApi.marquerLu(notif.id); } catch {}
    setClochOpen(false);
    router.push(lienNotification(notif));
    chargerNotifications();
  };

  // Navbar publique
  if (isPublicPage) {
    return (
      <nav className="sticky top-0 z-40 bg-sky-800 border-b border-sky-700 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 flex items-center justify-between h-14">
          <Link href="/" className="flex items-center gap-2">
            <img src="/logo.png" alt="logo" className="w-8 h-8 rounded-xl object-cover" />
            <span className="font-bold text-lg">
              <span className="text-green-400">Coloc</span>
              <span className="text-yellow-400">Bénin</span>
            </span>
          </Link>
          <div className="flex items-center gap-3">
            <Link href="/auth/login" className="text-sm text-sky-200 hover:text-white">Connexion</Link>
            <Link href="/auth/register" className="px-4 py-2 rounded-xl bg-white text-sky-800 text-sm font-semibold hover:bg-yellow-300 transition-colors">S inscrire</Link>
          </div>
        </div>
      </nav>
    );
  }

  return (
    <>
      {/* ── SIDEBAR DESKTOP ──────────────────────────────────── */}
      <aside className="hidden md:flex flex-col fixed left-0 top-0 h-full w-60 bg-sky-900 z-40 py-6">
        <div className="px-5 mb-8">
          <Link href="/dashboard" className="flex items-center gap-2">
            <img src="/logo.png" alt="logo" className="w-8 h-8 rounded-xl object-cover" />
            <span className="font-bold text-lg">
              <span className="text-green-400">Coloc</span>
              <span className="text-yellow-400">Bénin</span>
            </span>
          </Link>
        </div>

        <nav className="flex-1 px-3 space-y-1">
          {NAV_LINKS.map(({ href, label, icon }) => {
            const isActive = pathname === href || (href !== '/' && pathname.startsWith(href));
            return (
              <Link key={href} href={href}
                className={clsx(
                  'flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200',
                  isActive ? 'bg-sky-700 text-white shadow-lg' : 'text-sky-200 hover:bg-sky-800 hover:text-white'
                )}>
                {icon}
                <span>{label}</span>
                {/* Badge cloche sur Annonces */}
                {href === '/annonces' && nonLues > 0 && (
                  <span className="ml-auto bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                    {nonLues > 9 ? '9+' : nonLues}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        <div className="px-3 mt-4 border-t border-sky-800 pt-4">
          {!abonnementActif && (
            <Link href="/abonnement" className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500/10 text-amber-400 text-xs font-medium mb-3 hover:bg-amber-500/20 transition-colors">
              <span>⚡</span> Activer l abonnement
            </Link>
          )}
          <div className="relative" ref={profileRef}>
            <button onClick={() => setProfileOpen(!profileOpen)}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-sky-800 transition-colors">
              {userPhoto
                ? <img src={userPhoto} alt="" className="w-8 h-8 rounded-full object-cover flex-shrink-0" />
                : <span className="w-8 h-8 rounded-full bg-sky-700 text-white flex items-center justify-center text-xs font-bold flex-shrink-0">
                    {user.prenom[0]}{user.nom[0]}
                  </span>
              }
              <div className="text-left min-w-0 flex-1">
                <p className="text-sm font-medium text-white truncate">{user.prenom} {user.nom}</p>
                <p className="text-xs text-sky-400 truncate">{user.email}</p>
              </div>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4 text-sky-400 flex-shrink-0">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {profileOpen && (
              <div className="absolute bottom-full left-0 right-0 mb-2 bg-sky-950 border border-sky-800 rounded-2xl py-2 shadow-xl z-50">
                <Link href="/profil" onClick={() => setProfileOpen(false)} className="flex items-center gap-3 px-4 py-2.5 text-sm text-sky-200 hover:bg-sky-800 hover:text-white transition-colors">
                  <span>👤</span> Mon profil
                </Link>
                <Link href="/abonnement" onClick={() => setProfileOpen(false)} className="flex items-center gap-3 px-4 py-2.5 text-sm text-sky-200 hover:bg-sky-800 hover:text-white transition-colors">
                  <span>💳</span> Mon abonnement
                </Link>
                <div className="border-t border-sky-800 mt-1 pt-1">
                  <button onClick={() => { logout(); setProfileOpen(false); }} className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-400 hover:bg-sky-800 transition-colors">
                    <span>🚪</span> Deconnexion
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* ── TOPBAR MOBILE ────────────────────────────────────── */}
      <nav className="md:hidden sticky top-0 z-40 bg-sky-900 border-b border-sky-800 flex items-center justify-between px-4 h-14">
        <button onClick={() => setMobileOpen(true)} className="w-9 h-9 flex flex-col items-center justify-center gap-1.5 rounded-lg hover:bg-sky-800 transition-colors">
          <span className="block w-5 h-0.5 bg-sky-300" />
          <span className="block w-5 h-0.5 bg-sky-300" />
          <span className="block w-5 h-0.5 bg-sky-300" />
        </button>

        <Link href="/dashboard" className="flex items-center gap-2">
          <img src="/logo.png" alt="logo" className="w-7 h-7 rounded-lg object-cover" />
          <span className="font-bold text-base">
            <span className="text-green-400">Coloc</span>
            <span className="text-yellow-400">Bénin</span>
          </span>
        </Link>

        <div className="flex items-center gap-2">
          {/* Cloche notifications mobile (sur /annonces) */}
          {isAnnoncesPage && (
            <div className="relative" ref={clochRef}>
              <button onClick={handleClochClick} className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-sky-800 transition-colors relative">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-5 h-5 text-sky-200">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
                {nonLues > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 bg-red-500 text-white text-xs font-bold rounded-full w-4 h-4 flex items-center justify-center">
                    {nonLues > 9 ? '9+' : nonLues}
                  </span>
                )}
              </button>

              {clochOpen && (
                <div className="absolute right-0 top-11 w-80 bg-white border border-gray-100 rounded-2xl shadow-xl z-50 overflow-hidden">
                  <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
                    <p className="font-semibold text-gray-900 text-sm">Notifications</p>
                    {nonLues > 0 && (
                      <button onClick={handleToutMarquerLu} className="text-xs text-blue-600 hover:underline">Tout marquer lu</button>
                    )}
                  </div>
                  {notifications.length === 0 ? (
                    <div className="px-4 py-8 text-center">
                      <p className="text-2xl mb-2">🔔</p>
                      <p className="text-sm text-gray-400">Aucune notification</p>
                    </div>
                  ) : (
                    <div>
                      {notifications.map(notif => (
                        <button key={notif.id} onClick={() => handleNotifClick(notif)}
                          className={clsx('w-full flex items-start gap-3 px-4 py-3 hover:bg-gray-50 transition-colors text-left border-b border-gray-50 last:border-0',
                            !notif.lu && 'bg-blue-50/50')}>
                          <span className="text-lg flex-shrink-0 mt-0.5">
                            {notif.type === 'NOUVELLE_ANNONCE' ? '🏠' :
                             notif.type === 'DEMANDE_COLOCATION' ? '🤝' :
                             notif.type === 'COLOCATION_ACCEPTEE' ? '✅' :
                             notif.type === 'COLOCATION_REJETEE' ? '❌' : '🔔'}
                          </span>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-gray-900 truncate">{notif.titre}</p>
                            <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{notif.message}</p>
                            <p className="text-xs text-gray-400 mt-1">{tempsRelatif(notif.createdAt)}</p>
                          </div>
                          {!notif.lu && <span className="w-2 h-2 rounded-full bg-blue-500 flex-shrink-0 mt-2" />}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          <button onClick={() => setProfileOpen(!profileOpen)} className="w-9 h-9 rounded-full overflow-hidden border-2 border-sky-700">
            {userPhoto
              ? <img src={userPhoto} alt="" className="w-full h-full object-cover" />
              : <span className="w-full h-full bg-sky-700 text-white flex items-center justify-center text-xs font-bold">
                  {user.prenom[0]}{user.nom[0]}
                </span>
            }
          </button>
        </div>
      </nav>

      {/* ── MENU MOBILE DRAWER ───────────────────────────────── */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          <div className="absolute inset-0 bg-black/60" onClick={() => setMobileOpen(false)} />
          <div className="relative w-64 bg-sky-900 h-full flex flex-col py-6">
            <div className="px-5 mb-8 flex items-center justify-between">
              <Link href="/dashboard" className="flex items-center gap-2" onClick={() => setMobileOpen(false)}>
                <img src="/logo.png" alt="logo" className="w-7 h-7 rounded-lg object-cover" />
                <span className="font-bold text-base">
                  <span className="text-green-400">Coloc</span>
                  <span className="text-yellow-400">Bénin</span>
                </span>
              </Link>
              <button onClick={() => setMobileOpen(false)} className="text-sky-400 hover:text-white">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <nav className="flex-1 px-3 space-y-1">
              {NAV_LINKS.map(({ href, label, icon }) => {
                const isActive = pathname === href || (href !== '/' && pathname.startsWith(href));
                return (
                  <Link key={href} href={href} onClick={() => setMobileOpen(false)}
                    className={clsx('flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all',
                      isActive ? 'bg-sky-700 text-white' : 'text-sky-200 hover:bg-sky-800 hover:text-white')}>
                    {icon}
                    {label}
                    {href === '/annonces' && nonLues > 0 && (
                      <span className="ml-auto bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                        {nonLues > 9 ? '9+' : nonLues}
                      </span>
                    )}
                  </Link>
                );
              })}
            </nav>
            <div className="px-3 border-t border-sky-800 pt-4">
              <Link href="/profil" onClick={() => setMobileOpen(false)} className="flex items-center gap-3 px-4 py-2.5 text-sm text-sky-200 hover:bg-sky-800 rounded-xl">
                <span>👤</span> Mon profil
              </Link>
              <button onClick={() => { logout(); setMobileOpen(false); }} className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-400 hover:bg-sky-800 rounded-xl">
                <span>🚪</span> Deconnexion
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
