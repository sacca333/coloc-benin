'use client';
import Link from 'next/link';
import { Navbar } from '../components/layout/Navbar';
import { useAuth } from '../hooks/useAuth';

export default function HomePage() {
  const { user } = useAuth();

  return (
    <>
      <Navbar />
      <main>
        {/* Hero avec image de fond */}
        <section
          className="relative min-h-[520px] flex items-center justify-center text-center px-4 py-20"
          style={{
            backgroundImage: "url('/hero-background.png')",
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        >
          <div className="absolute inset-0" style={{ background: 'rgba(0,40,80,0.65)' }} />
          <div className="relative z-10 max-w-3xl mx-auto w-full">
            <span className="inline-block bg-white/20 text-white text-xs font-semibold px-4 py-1.5 rounded-full mb-4 backdrop-blur-sm border border-white/30">
              Plateforme N1 de colocation etudiante au Benin
            </span>
            <h1 className="text-4xl md:text-5xl font-bold text-white leading-tight drop-shadow-lg">
              Trouvez votre colocation
              <span className="block text-yellow-300 mt-1">ideale au Benin</span>
            </h1>
            <p className="mt-5 text-white/85 text-base max-w-xl mx-auto leading-relaxed">
              La plateforme dediee aux etudiants beninois pour trouver des colocataires, gerer les loyers et simplifier la vie en communaute.
            </p>
            <div className="mt-8 flex items-center justify-center gap-4 flex-wrap">
              <Link href="/annonces" className="px-8 py-3 text-base font-semibold rounded-2xl text-blue-900 bg-white hover:bg-yellow-300 transition-all duration-200 shadow-lg active:scale-95">
                Voir les annonces
              </Link>
              {user ? (
                <Link href="/dashboard" className="px-8 py-3 text-base font-semibold rounded-2xl text-white border-2 border-white/60 hover:bg-white/20 transition-all duration-200 backdrop-blur-sm active:scale-95">
                  Mon tableau de bord
                </Link>
              ) : (
                <Link href="/auth/register" className="px-8 py-3 text-base font-semibold rounded-2xl text-white border-2 border-white/60 hover:bg-white/20 transition-all duration-200 backdrop-blur-sm active:scale-95">
                  Creer un compte - 300 FCFA/mois
                </Link>
              )}
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="max-w-5xl mx-auto px-4 py-16">
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { icon: '🔍', title: 'Trouvez des colocataires', desc: "Filtrez par ville, universite, budget et preferences de vie. Profils d etudiants verifies." },
              { icon: '💬', title: 'Discutez et trouvez un accord', desc: 'Messagerie integree pour echanger et valider votre colocation en toute simplicite.' },
              { icon: '📱', title: 'Payez avec votre mobile', desc: "Abonnement via MTN MoMo, C cash ou Moov Money. 300 FCFA/mois seulement." },
            ].map(({ icon, title, desc }) => (
              <div key={title} className="card hover:shadow-md transition-all duration-200 hover:-translate-y-1">
                <span className="text-3xl mb-3 block">{icon}</span>
                <h3 className="font-semibold text-gray-900 mb-2">{title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="bg-blue-50 border-t border-blue-100">
          <div className="max-w-2xl mx-auto px-4 py-12 text-center">
            {user ? (
              <>
                <h2 className="text-xl font-semibold text-blue-800 mb-2">Bienvenue, {user.prenom} !</h2>
                <p className="text-sm text-blue-600 mb-6">Gerez vos colocations et annonces depuis votre tableau de bord.</p>
                <Link href="/dashboard" className="px-8 py-3 text-base font-semibold rounded-2xl text-white bg-blue-700 hover:bg-blue-800 transition-all inline-block">Aller au tableau de bord</Link>
              </>
            ) : (
              <>
                <h2 className="text-xl font-semibold text-blue-800 mb-2">Pret a trouver votre coloc ?</h2>
                <p className="text-sm text-blue-600 mb-6">Rejoignez des centaines d etudiants beninois deja inscrits.</p>
                <Link href="/auth/register" className="px-8 py-3 text-base font-semibold rounded-2xl text-white bg-blue-700 hover:bg-blue-800 transition-all inline-block">S inscrire gratuitement</Link>
              </>
            )}
          </div>
        </section>
      </main>
      <footer className="border-t border-gray-100 py-6 text-center text-xs text-gray-400">
        {new Date().getFullYear()} ColocBenin - Tous droits reserves
      </footer>
    </>
  );
}
