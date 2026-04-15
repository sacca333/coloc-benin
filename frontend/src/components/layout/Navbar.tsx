'use client';
import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '../../hooks/useAuth';
import { photoUrl } from '../../lib/api';
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

export function Navbar() {
  const pathname = usePathname();
  const { user, abonnementActif, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setProfileOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const userPhoto = photoUrl(user?.photo);

  // Pages publiques : pas de sidebar
  const isPublicPage = !user || pathname.startsWith('/auth');
  if (isPublicPage) {
    return (
      <nav className="sticky top-0 z-40 bg-white border-b border-gray-100 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 flex items-center justify-between h-14">
          <Link href="/" className="font-bold text-primary-600 text-lg">ColocBenin</Link>
          <div className="flex items-center gap-3">
            <Link href="/auth/login" className="text-sm text-gray-600 hover:text-gray-900">Connexion</Link>
            <Link href="/auth/register" className="btn-primary text-sm">S inscrire</Link>
          </div>
        </div>
      </nav>
    );
  }

  return (
    <>
      {/* ── SIDEBAR DESKTOP ──────────────────────────────────── */}
      <aside className="hidden md:flex flex-col fixed left-0 top-0 h-full w-60 bg-gray-950 z-40 py-6">
        <div className="px-5 mb-8">
          <Link href="/dashboard" className="flex items-center gap-2">
            <img src="/logo.png" alt="logo" className="w-8 h-8 rounded-xl object-cover" />
            <span className="font-bold text-lg"><span className="text-green-400">Coloc</span><span className="text-yellow-400">Benin</span></span>
          </Link>
        </div>

        <nav className="flex-1 px-3 space-y-1">
          {NAV_LINKS.map(({ href, label, icon }) => {
            const isActive = pathname === href || (href !== '/' && pathname.startsWith(href));
            return (
              <Link key={href} href={href}
                className={clsx(
                  'flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200',
                  isActive
                    ? 'bg-violet-600 text-white shadow-lg shadow-violet-900/30'
                    : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                )}>
                {icon}
                {label}
              </Link>
            );
          })}
        </nav>

        <div className="px-3 mt-4 border-t border-gray-800 pt-4">
          {!abonnementActif && (
            <Link href="/abonnement" className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500/10 text-amber-400 text-xs font-medium mb-3 hover:bg-amber-500/20 transition-colors">
              <span>⚡</span> Activer l abonnement
            </Link>
          )}
          <div className="relative" ref={profileRef}>
            <button onClick={() => setProfileOpen(!profileOpen)}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-gray-800 transition-colors">
              {userPhoto
                ? <img src={userPhoto} alt="" className="w-8 h-8 rounded-full object-cover flex-shrink-0" />
                : <span className="w-8 h-8 rounded-full bg-violet-600 text-white flex items-center justify-center text-xs font-bold flex-shrink-0">
                    {user.prenom[0]}{user.nom[0]}
                  </span>
              }
              <div className="text-left min-w-0 flex-1">
                <p className="text-sm font-medium text-white truncate">{user.prenom} {user.nom}</p>
                <p className="text-xs text-gray-500 truncate">{user.email}</p>
              </div>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4 text-gray-500 flex-shrink-0">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {profileOpen && (
              <div className="absolute bottom-full left-0 right-0 mb-2 bg-gray-900 border border-gray-700 rounded-2xl py-2 shadow-xl z-50">
                <Link href="/profil" onClick={() => setProfileOpen(false)} className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-300 hover:bg-gray-800 hover:text-white transition-colors">
                  <span>👤</span> Mon profil
                </Link>
                <Link href="/abonnement" onClick={() => setProfileOpen(false)} className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-300 hover:bg-gray-800 hover:text-white transition-colors">
                  <span>💳</span> Mon abonnement
                </Link>
                <div className="border-t border-gray-700 mt-1 pt-1">
                  <button onClick={() => { logout(); setProfileOpen(false); }} className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-400 hover:bg-gray-800 transition-colors">
                    <span>🚪</span> Deconnexion
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* ── TOPBAR MOBILE ────────────────────────────────────── */}
      <nav className="md:hidden sticky top-0 z-40 bg-gray-950 border-b border-gray-800 flex items-center justify-between px-4 h-14">
        <button onClick={() => setMobileOpen(true)} className="w-9 h-9 flex flex-col items-center justify-center gap-1.5 rounded-lg hover:bg-gray-800 transition-colors">
          <span className="block w-5 h-0.5 bg-gray-400" />
          <span className="block w-5 h-0.5 bg-gray-400" />
          <span className="block w-5 h-0.5 bg-gray-400" />
        </button>
        <Link href="/dashboard" className="font-bold text-lg"><span className="text-green-400">Coloc</span><span className="text-yellow-400">Benin</span></Link>
        <button onClick={() => setProfileOpen(!profileOpen)} className="w-9 h-9 rounded-full overflow-hidden border-2 border-gray-700">
          {userPhoto
            ? <img src={userPhoto} alt="" className="w-full h-full object-cover" />
            : <span className="w-full h-full bg-violet-600 text-white flex items-center justify-center text-xs font-bold">
                {user.prenom[0]}{user.nom[0]}
              </span>
          }
        </button>
      </nav>

      {/* ── MENU MOBILE DRAWER ───────────────────────────────── */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          <div className="absolute inset-0 bg-black/60" onClick={() => setMobileOpen(false)} />
          <div className="relative w-64 bg-gray-950 h-full flex flex-col py-6">
            <div className="px-5 mb-8 flex items-center justify-between">
              <span className="font-bold text-lg"><span className="text-green-400">Coloc</span><span className="text-yellow-400">Benin</span></span>
              <button onClick={() => setMobileOpen(false)} className="text-gray-400 hover:text-white">
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
                      isActive ? 'bg-violet-600 text-white' : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                    )}>
                    {icon}
                    {label}
                  </Link>
                );
              })}
            </nav>
            <div className="px-3 border-t border-gray-800 pt-4">
              <Link href="/profil" onClick={() => setMobileOpen(false)} className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-300 hover:bg-gray-800 rounded-xl">
                <span>👤</span> Mon profil
              </Link>
              <button onClick={() => { logout(); setMobileOpen(false); }} className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-400 hover:bg-gray-800 rounded-xl">
                <span>🚪</span> Deconnexion
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
