import type { Metadata, Viewport } from 'next';
import './globals.css';
import { AppProviders } from '../components/layout/AppProviders';
import { LayoutWrapper } from '../components/layout/LayoutWrapper';

export const metadata: Metadata = {
  title: 'ColocBenin - Trouvez votre colocation',
  description: 'Plateforme de gestion de colocation etudiante au Benin',
  manifest: '/manifest.json',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  interactiveWidget: 'resizes-content',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body className="bg-gray-50 text-gray-900 min-h-dvh">
        <AppProviders>
          <LayoutWrapper>{children}</LayoutWrapper>
        </AppProviders>
      </body>
    </html>
  );
}
