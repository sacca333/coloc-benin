'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '../../hooks/useAuth';
import clsx from 'clsx';

const NAV_ITEMS = [
  {
    href: '/',
    label: 'Accueil',
    icon: (active: boolean) => (
      <svg viewBox="0 0 24 24" fill={active ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth={active ? 0 : 1.8} className="w-6 h-6">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
      </svg>
    ),
  },
  {
    href: '/annonces',
    label: 'Annonces',
    icon: (active: boolean) => (
      <svg viewBox="0 0 24 24" fill={active ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth={active ? 0 : 1.8} className="w-6 h-6">
        <path strokeLinecap="round" strokeLinejoin="round" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
      </svg>
    ),
  },
  {
    href: '/annonces/creer',
    label: 'Publier',
    icon: (_active: boolean) => (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-6 h-6">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
      </svg>
    ),
    isSpecial: true,
  },
  {
    href: '/mes-annonces',
    label: 'Mes annonces',
    icon: (active: boolean) => (
      <svg viewBox="0 0 24 24" fill={active ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth={active ? 0 : 1.8} className="w-6 h-6">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
      </svg>
    ),
  },
];

export function BottomNav() {
  const pathname = usePathname();
  const { user, abonnementActif } = useAuth();

  if (!user) return null;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-100"
      style={{ boxShadow: '0 -4px 20px rgba(123, 97, 255, 0.08)' }}
    >
      <div className="max-w-lg mx-auto px-2 flex items-center justify-around h-16">
        {NAV_ITEMS.map(({ href, label, icon, isSpecial }) => {
          const isActive = pathname === href || (href !== '/' && pathname.startsWith(href));
          const isDisabled = href === '/annonces/creer' && !abonnementActif;

          if (isSpecial) {
            return (
              <Link
                key={href}
                href={isDisabled ? '/abonnement' : href}
                className="flex flex-col items-center justify-center -mt-6"
              >
                <span
                  className="w-14 h-14 rounded-full flex items-center justify-center text-white transition-all duration-200 active:scale-95"
                  style={{
                    background: 'linear-gradient(135deg, #7B61FF 0%, #9B85FF 100%)',
                    boxShadow: '0 4px 15px rgba(123, 97, 255, 0.4)',
                  }}
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} className="w-6 h-6">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                  </svg>
                </span>
                <span className="text-xs mt-1 font-medium text-gray-500">{label}</span>
              </Link>
            );
          }

          return (
            <Link
              key={href}
              href={href}
              className={clsx(
                'flex flex-col items-center justify-center gap-1 px-3 py-2 rounded-2xl transition-all duration-200 active:scale-95 min-w-0',
                isActive ? 'text-violet-600' : 'text-gray-400 hover:text-gray-600'
              )}
            >
              <span className={clsx('transition-transform duration-200', isActive && 'scale-110')}>
                {icon(isActive)}
              </span>
              <span className={clsx('text-xs font-medium truncate', isActive && 'font-semibold')}>
                {label}
              </span>
              {isActive && (
                <span className="absolute bottom-1 w-1 h-1 rounded-full bg-violet-600" />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
