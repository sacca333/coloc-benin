'use client';
import { usePathname } from 'next/navigation';
import { useAuth } from '../../hooks/useAuth';

export function LayoutWrapper({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const pathname = usePathname();
  const isPublic = !user || pathname.startsWith('/auth');
  const isAdmin = pathname.startsWith('/admin');

  // Pages admin : pas de padding, elles ont leur propre layout complet
  if (isAdmin) return <>{children}</>;

  // Pages authentifiées : padding pour laisser place à la sidebar (240px = w-60)
  return (
    <div className={!isPublic ? 'md:pl-60' : ''}>
      {children}
    </div>
  );
}
