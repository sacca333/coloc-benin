'use client';
import Link from 'next/link';

export function Footer() {
  return (
    <footer className="bg-sky-900 text-gray-300 mt-auto">
      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">

          {/* Logo + description */}
          <div className="md:col-span-1">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <img src="/logo.png" alt="logo" className="w-8 h-8 rounded-xl object-cover" />
              <span className="font-bold text-lg">
                <span className="text-green-400">Coloc</span>
                <span className="text-yellow-400">Bénin</span>
              </span>
            </Link>
            <p className="text-sm text-gray-400 leading-relaxed mb-5">
              La plateforme de colocation étudiante au Bénin. Simple, local, abordable.
            </p>
            <div className="flex flex-wrap gap-2">
              {['MTN MoMo', 'Moov Money', "C'Cash"].map(op => (
                <span key={op} className="text-xs px-3 py-1.5 rounded-full bg-sky-800 text-gray-300 border border-sky-700">
                  {op}
                </span>
              ))}
            </div>
          </div>

          {/* Plateforme */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-4">Plateforme</h4>
            <ul className="space-y-3">
              {[
                { label: 'Voir les annonces', href: '/annonces' },
                { label: 'Créer un compte', href: '/auth/register' },
                { label: 'Se connecter', href: '/auth/login' },
                { label: 'Comment ça marche', href: '/#features' },
                { label: 'Tarifs', href: '/abonnement' },
              ].map(({ label, href }) => (
                <li key={label}>
                  <Link href={href} className="text-sm text-gray-400 hover:text-white transition-colors">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Ressources */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-4">Ressources</h4>
            <ul className="space-y-3">
              {[
                { label: 'Conseils colocation', href: '#' },
                { label: 'FAQ', href: '#' },
                { label: 'Blog étudiant', href: '#' },
                { label: 'Villes du Bénin', href: '#' },
              ].map(({ label, href }) => (
                <li key={label}>
                  <Link href={href} className="text-sm text-gray-400 hover:text-white transition-colors">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-4">Contact</h4>
            <div className="space-y-3">
              <a href="https://wa.me/22997000000" target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-3 p-3 rounded-xl bg-sky-800 hover:bg-sky-700 transition-colors border border-sky-700">
                <div className="w-9 h-9 rounded-xl bg-green-500 flex items-center justify-center flex-shrink-0">
                  <svg viewBox="0 0 24 24" fill="white" className="w-5 h-5">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                  </svg>
                </div>
                <span className="text-sm font-medium text-white">WhatsApp</span>
              </a>

              <a href="mailto:contact@colocbenin.bj"
                className="flex items-center gap-3 p-3 rounded-xl bg-sky-800 hover:bg-sky-700 transition-colors border border-sky-700">
                <div className="w-9 h-9 rounded-xl bg-red-500 flex items-center justify-center flex-shrink-0">
                  <svg viewBox="0 0 24 24" fill="white" className="w-5 h-5">
                    <path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
                  </svg>
                </div>
                <span className="text-sm font-medium text-white">Email</span>
              </a>

              <a href="https://facebook.com/colocbenin" target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-3 p-3 rounded-xl bg-sky-800 hover:bg-sky-700 transition-colors border border-sky-700">
                <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center flex-shrink-0">
                  <svg viewBox="0 0 24 24" fill="white" className="w-5 h-5">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                </div>
                <span className="text-sm font-medium text-white">Facebook</span>
              </a>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-sky-800 mt-10 pt-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-gray-500">
            © {new Date().getFullYear()} ColocBénin · Tous droits réservés · Cotonou, Bénin
          </p>
          <div className="flex items-center gap-6">
            <Link href="/legal/cgu" className="text-xs text-gray-500 hover:text-white transition-colors">CGU</Link>
            <Link href="/legal/confidentialite" className="text-xs text-gray-500 hover:text-white transition-colors">Confidentialité</Link>
            <Link href="/legal/cookies" className="text-xs text-gray-500 hover:text-white transition-colors">Cookies</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
