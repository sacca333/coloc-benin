import type { Metadata } from 'next';
import './globals.css';
import { AppProviders } from '../components/layout/AppProviders';

export const metadata: Metadata = {
  title: 'ColocBenin - Trouvez votre colocation',
  description: 'Plateforme de gestion de colocation etudiante au Benin',
  manifest: '/manifest.json',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body className="bg-gray-50 text-gray-900 min-h-screen">
        <AppProviders>
          <div className="md:pl-60">
            {children}
          </div>
        </AppProviders>
      </body>
    </html>
  );
}
