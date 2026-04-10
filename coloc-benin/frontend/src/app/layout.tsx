// ── app/layout.tsx ────────────────────────────────────────────────────────────
import type { Metadata } from 'next';
import './globals.css';
import { AppProviders } from '../components/layout/AppProviders';

export const metadata: Metadata = {
  title: 'ColocBénin — Trouvez votre colocation',
  description: 'Plateforme de gestion de colocation étudiante au Bénin',
  manifest: '/manifest.json',
  themeColor: '#7F77DD',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body className="bg-gray-50 text-gray-900 min-h-screen">
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
