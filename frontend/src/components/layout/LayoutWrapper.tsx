'use client';
import { usePathname } from 'next/navigation';
import { useAuth } from '../../hooks/useAuth';
import { Navbar } from './Navbar';

export function LayoutWrapper({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const pathname = usePathname();
  const isPublic = !user || pathname.startsWith('/auth');
  const isAdmin = pathname.startsWith('/admin');

  // Pages admin : pas de Navbar ni de padding, elles ont leur propre layout
  if (isAdmin) return <>{children}</>;

  return (
    <>
      {!isPublic && <Navbar />}
      <div className={!isPublic ? 'md:pl-60' : ''}>
        {children}
      </div>
    </>
  );
}
