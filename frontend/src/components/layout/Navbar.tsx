'use client';
import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '../../hooks/useAuth';
import { photoUrl } from '../../lib/api';
import clsx from 'clsx';

const NAV_LINKS = [
  { href: '/annonces', label: 'Annonces', icon: '🏠' },
  { href: '/colocations', label: 'Colocations', icon: '🤝' },
  { href: '/messagerie', label: 'Messagerie', icon: '💬' },
  { href: '/dashboard', label: 'Tableau de bord', icon: '📊' },
];

export function Navbar() {
  const pathname = usePathname();
  const { user, abonnementActif, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
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

  return (
    <>
      <nav className="sticky top-0 z-40 bg-gray-700 border-b border-gray-800 shadow-lg">
        <div className="max-w-6xl mx-auto px-4 flex items-center justify-between h-14">
          <div className="flex items-center gap-2">
            {user && (
              <button onClick={() => setMenuOpen(!menuOpen)} className="w-9 h-9 flex flex-col items-center justify-center gap-1.5 rounded-lg hover:bg-gray-600 transition-colors">
                <span className={clsx('block w-5 h-0.5 bg-white transition-all', menuOpen && 'rotate-45 translate-y-2')} />
                <span className={clsx('block w-5 h-0.5 bg-white transition-all', menuOpen && 'opacity-0')} />
                <span className={clsx('block w-5 h-0.5 bg-white transition-all', menuOpen && '-rotate-45 -translate-y-2')} />
              </button>
            )}
            <Link href="/" className="flex items-center gap-2">
              <img src="/logo.png" alt="ColocBenin" className="w-8 h-8 rounded" />
              <span className="text-white text-lg">
                <span className="font-bold">Coloc</span>
                <span className="font-normal">Benin</span>
              </span>
            </Link>
          </div>

          <div className="flex items-center gap-3">
            {user ? (
              <>
                {!abonnementActif && (
                  <Link href="/abonnement" className="text-xs bg-amber-50 text-amber-700 border border-amber-200 px-3 py-1 rounded-full font-medium hidden md:block">
                    Abonnement requis
                  </Link>
                )}
                <div className="relative" ref={profileRef}>
                  <button onClick={() => setProfileOpen(!profileOpen)} className="flex items-center justify-center w-9 h-9 rounded-full overflow-hidden border-2 border-primary-100 hover:border-primary-400 transition-colors">
                    {userPhoto
                      ? <img src={userPhoto} alt="" className="w-full h-full object-cover" />
                      : <span className="w-full h-full bg-primary-100 text-primary-600 flex items-center justify-center text-sm font-semibold">
                        {user.prenom[0]}{user.nom[0]}
                      </span>
                    }
                  </button>

                  {profileOpen && (
                    <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-gray-100 py-2 z-50">
                      <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-100 mb-1">
                        {userPhoto
                          ? <img src={userPhoto} alt="" className="w-10 h-10 rounded-full object-cover" />
                          : <span className="w-10 h-10 rounded-full bg-primary-100 text-primary-600 flex items-center justify-center text-sm font-semibold flex-shrink-0">
                            {user.prenom[0]}{user.nom[0]}
                          </span>
                        }
                        <div className="min-w-0">
                          <p className="font-semibold text-gray-900 text-sm truncate">{user.prenom} {user.nom}</p>
                          <p className="text-xs text-gray-500 truncate">{user.email}</p>
                        </div>
                      </div>
                      <div className="px-2">
                        <Link href="/" onClick={() => setProfileOpen(false)} className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                          <span>🏠</span> Accueil
                        </Link>
                        <Link href="/profil" onClick={() => setProfileOpen(false)} className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                          <span>👤</span> Mon profil
                        </Link>
                        <Link href="/abonnement" onClick={() => setProfileOpen(false)} className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                          <span>💳</span> Mon abonnement
                        </Link>
                      </div>
                      <div className="border-t border-gray-100 mt-1 px-2 pt-1">
                        <button onClick={() => { logout(); setProfileOpen(false); }} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-red-500 hover:bg-red-50 transition-colors">
                          <span>🚪</span> Deconnexion
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                <Link href="/auth/login" className="text-sm text-gray-200 hover:text-white transition-colors">Connexion</Link>
                <Link href="/auth/register" className="bg-white text-gray-700 hover:bg-gray-100 px-4 py-2 rounded-lg font-medium text-sm transition-colors">S inscrire</Link>
              </>
            )}
          </div>
        </div>
      </nav>

      {menuOpen && (
        <div className="fixed inset-0 z-50 flex">
          <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={() => setMenuOpen(false)} />
          <div className="relative w-72 bg-white h-full shadow-xl flex flex-col">
            <div className="px-5 py-5 border-b border-gray-100">
              <p className="font-semibold text-primary-600 text-lg">ColocBenin</p>
              {user && <p className="text-sm text-gray-500 mt-0.5">{user.email}</p>}
            </div>
            <div className="flex-1 px-3 py-4 space-y-1">
              {NAV_LINKS.map(({ href, label, icon }) => (
                <Link key={href} href={href} onClick={() => setMenuOpen(false)} className={clsx('flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors', pathname.startsWith(href) ? 'bg-primary-50 text-primary-600' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900')}>
                  <span className="text-lg">{icon}</span>
                  {label}
                </Link>
              ))}
            </div>
            {user && (
              <div className="px-3 py-4 border-t border-gray-100 space-y-1">
                <Link href="/profil" onClick={() => setMenuOpen(false)} className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors">
                  <span className="text-lg">👤</span> Mon profil
                </Link>
                <button onClick={() => { logout(); setMenuOpen(false); }} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-red-500 hover:bg-red-50 transition-colors">
                  <span className="text-lg">🚪</span> Deconnexion
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
