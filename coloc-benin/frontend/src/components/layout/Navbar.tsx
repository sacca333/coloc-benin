'use client';
import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '../../hooks/useAuth';
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

  return (
    <>
      <nav className="sticky top-0 z-40 bg-white border-b border-gray-100 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 flex items-center justify-between h-14">

          {/* Bouton hamburger + Logo */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="w-9 h-9 flex flex-col items-center justify-center gap-1.5 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <span className={clsx('block w-5 h-0.5 bg-gray-600 transition-all', menuOpen && 'rotate-45 translate-y-2')} />
              <span className={clsx('block w-5 h-0.5 bg-gray-600 transition-all', menuOpen && 'opacity-0')} />
              <span className={clsx('block w-5 h-0.5 bg-gray-600 transition-all', menuOpen && '-rotate-45 -translate-y-2')} />
            </button>

            <Link href="/" className="font-semibold text-primary-600 text-lg tracking-tight">
              Coloc<span className="text-primary-400">Bénin</span>
            </Link>
          </div>

          {/* Actions droite */}
          <div className="flex items-center gap-3">
            {user ? (
              <>
                {!abonnementActif && (
                  <Link href="/abonnement" className="text-xs bg-amber-50 text-amber-700 border border-amber-200 px-3 py-1 rounded-full font-medium">
                    Abonnement requis
                  </Link>
                )}
                <span className="text-sm text-gray-600 hidden md:inline">
                  {user.prenom} {user.nom}
                </span>
              </>
            ) : (
              <>
                <Link href="/auth/login" className="text-sm text-gray-600 hover:text-gray-900">
                  Connexion
                </Link>
                <Link href="/auth/register" className="btn-primary text-sm">
                  S'inscrire
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Menu latéral */}
      {menuOpen && (
        <div className="fixed inset-0 z-50 flex">
          {/* Overlay */}
          <div
            className="absolute inset-0 bg-black/30 backdrop-blur-sm"
            onClick={() => setMenuOpen(false)}
          />

          {/* Panel gauche */}
          <div className="relative w-72 bg-white h-full shadow-xl flex flex-col">

            {/* Header du menu */}
            <div className="px-5 py-5 border-b border-gray-100">
              <p className="font-semibold text-primary-600 text-lg">ColocBénin</p>
              {user && (
                <p className="text-sm text-gray-500 mt-0.5">{user.email}</p>
              )}
            </div>

            {/* Liens de navigation */}
            <div className="flex-1 px-3 py-4 space-y-1">
              {NAV_LINKS.map(({ href, label, icon }) => (
                <Link
                  key={href}
                  href={href}
                  onClick={() => setMenuOpen(false)}
                  className={clsx(
                    'flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors',
                    pathname.startsWith(href)
                      ? 'bg-primary-50 text-primary-600'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  )}
                >
                  <span className="text-lg">{icon}</span>
                  {label}
                </Link>
              ))}
            </div>

            {/* Profil + Déconnexion */}
            {user && (
              <div className="px-3 py-4 border-t border-gray-100 space-y-1">
                <Link
                  href="/profil"
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors"
                >
                  <span className="text-lg">👤</span>
                  Mon profil
                </Link>
                <button
                  onClick={() => { logout(); setMenuOpen(false); }}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-red-500 hover:bg-red-50 transition-colors"
                >
                  <span className="text-lg">🚪</span>
                  Déconnexion
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}