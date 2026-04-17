'use client';
import { usePathname } from 'next/navigation';
import { useAuth } from '../../hooks/useAuth';

export function LayoutWrapper({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const pathname = usePathname();
  const isPublic = !user || pathname.startsWith('/auth');
  return (
    <div className={!isPublic ? 'md:pl-60' : ''}>
      {children}
    </div>
  );
}
