// ── components/layout/AppProviders.tsx ───────────────────────────────────────
'use client';
import { useEffect } from 'react';
import { useAuthInit } from '../../hooks/useAuth';

export function AppProviders({ children }: { children: React.ReactNode }) {
  useAuthInit();
  return <>{children}</>;
}
