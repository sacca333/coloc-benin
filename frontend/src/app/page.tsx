'use client';
import Link from 'next/link';
import { useState } from 'react';
import { useEffect } from 'react';
import { Navbar } from '../components/layout/Navbar';
import { Footer } from '../components/layout/Footer';
import { useAuth } from '../hooks/useAuth';




const SLIDES = [
  {
    image: '/trouvez.jpeg',
    icon: '🔍',
    title: 'Trouvez des colocataires',
    desc: "Filtrez par ville, université, budget et préférences de vie. Profils d'étudiants vérifiés.",
    badge: 'Recherche intelligente',
  },

  {
    image: '/discutez.jpeg',
    icon: '💬',
    title: 'Discutez et trouvez un accord',
    desc: 'Messagerie intégrée pour échanger, partager des photos et valider votre colocation en toute simplicité.',
    badge: 'Messagerie intégrée',
  },

  {
    image: '/payement.jpeg',
    icon: '📱',
    title: 'Payez avec votre mobile',
    desc: "Abonnement via MTN MoMo, C'Cash ou Moov Money. Seulement 300 FCFA par mois.",
    badge: 'Paiement mobile',
  },

];

export default function HomePage() {
  const { user } = useAuth();

  const [current, setCurrent] = useState(0);


  // Défilement automatique toutes les 3 secondes
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % SLIDES.length);
    }, 3000);
    return () => clearInterval(timer);
  }, []);

  return (
    <>
      <Navbar />
      <main>
        <section className="relative w-full">
          <img
            src="/hero-background.png"
            alt="Hero"
            className="w-full h-64 sm:h-72 md:h-80 lg:h-[520px] object-cover"
          />
          <div className="absolute inset-0 flex items-center justify-center text-center px-4">
            <div className="max-w-3xl mx-auto w-full">
              <span className="inline-block bg-white/20 text-white text-xs font-semibold px-4 py-1.5 rounded-full mb-4 backdrop-blur-sm border border-white/30">
                Plateforme N1 de colocation étudiante au Bénin
              </span>
              <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white leading-tight drop-shadow-lg">
                Trouvez votre colocation
                <span className="block text-yellow-300 mt-1">idéale au Bénin</span>
              </h1>
              <p className="mt-4 text-white/85 text-sm sm:text-base max-w-xl mx-auto leading-relaxed">
                La plateforme dédiée aux étudiants béninois pour trouver des colocataires, gérer les loyers et simplifier la vie en communauté.
              </p>
              <div className="mt-6 flex items-center justify-center gap-3 flex-wrap">
                <Link href="/annonces" className="px-6 sm:px-8 py-2.5 sm:py-3 text-sm sm:text-base font-semibold rounded-2xl text-blue-900 bg-white hover:bg-yellow-300 transition-all duration-200 shadow-lg active:scale-95">
                  Voir les annonces
                </Link>
                {user ? (
                  <Link href="/dashboard" className="px-6 sm:px-8 py-2.5 sm:py-3 text-sm sm:text-base font-semibold rounded-2xl text-white border-2 border-white/60 hover:bg-white/20 transition-all duration-200 backdrop-blur-sm active:scale-95">
                    Mon tableau de bord
                  </Link>
                ) : (
                  <Link href="/auth/register" className="px-6 sm:px-8 py-2.5 sm:py-3 text-sm sm:text-base font-semibold rounded-2xl text-white border-2 border-white/60 hover:bg-white/20 transition-all duration-200 backdrop-blur-sm active:scale-95">
                    Creer un compte - 300 FCFA/mois
                  </Link>
                )}
              </div>
            </div>
          </div>
        </section>



        {/* Section héro + stats */}
        <section className="w-full px-4 py-12 bg-gradient-to-b from-[#1a2744]/30 to-[#1a2744]/80 text-white">
          <div className="max-w-5xl mx-auto px-4 space-y-4">

            {/* Bloc principal */}
            <div className="bg-[#1a2744] rounded-2xl p-8 md:p-10 grid grid-cols-1 md:grid-cols-2 gap-8 items-center relative overflow-hidden">
              {/* Cercle décoratif */}
              <div className="absolute -top-16 -right-16 w-56 h-56 rounded-full bg-purple-500/10 pointer-events-none" />

              {/* Texte gauche */}
              <div className="relative z-10">
                <span className="inline-block bg-purple-500/20 text-purple-300 text-xs font-medium px-3 py-1 rounded-full mb-4 tracking-wide">
                  Plateforme étudiante · Bénin
                </span>
                <h2 className="text-2xl md:text-3xl font-semibold text-white leading-snug mb-3">
                  La colocation étudiante<br />
                  <span className="text-blue-300">repensée pour le Bénin</span>
                </h2>
                <p className="text-sm text-slate-400 leading-relaxed mb-6">
                  Vous cherchez un colocataire de confiance à{' '}
                  <strong className="text-slate-300">Cotonou, Abomey-Calavi ou Porto-Novo</strong> ?{' '}
                  <strong className="text-slate-300">ColocBénin</strong> est la première plateforme
                  dédiée aux étudiants béninois. Trouvez, discutez et emménagez — le tout depuis
                  votre téléphone, pour seulement{' '}
                  <strong className="text-slate-300">300 FCFA/mois</strong>.
                </p>
                <Link href="/auth/register" className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-5 py-2.5 rounded-xl transition-colors">
                  Créer mon compte gratuitement
                  <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                    <path d="M3 8h10M9 4l4 4-4 4" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </Link>
              </div>

              {/* Photo + callout droite */}
              <div className="relative z-10 flex flex-col items-center gap-3">
                <div className="w-48 h-48 md:w-52 md:h-52 rounded-2xl overflow-hidden shadow-2xl">
                  <img
                    src="/etudiants-coloc.png"
                    alt="Étudiants béninois dans leur chambre partagée"
                    className="w-full h-full object-cover object-top"
                  />
                </div>
                <div className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-center">
                  <p className="text-xs text-slate-400 mb-1">Abonnement mensuel</p>
                  <p className="text-sm font-semibold text-yellow-400">300 FCFA seulement !</p>
                </div>
              </div>
            </div>

            {/* Bande stats */}
            <div className="grid grid-cols-3 gap-3">
              {[
                { value: '500+', label: 'Étudiants inscrits' },
                { value: '30+', label: 'Villes couvertes' },
                { value: '98%', label: 'Étudiants satisfaits' },
              ].map(({ value, label }) => (
                <div key={label} className="bg-white/5 border border-white/[0.06] bg-[#1a2744] rounded-xl py-4 text-center">
                  <span className="block text-xl font-semibold text-white-300 mb-1">{value}</span>
                  <span className="text-xs text-white/60 text-slate-500">{label}</span>
                </div>
              ))}
            </div>

          </div>
        </section>


        {/* ---- NOUVELLE SECTION SLIDER ---- */}
        <section className="w-full">
          <div className="relative overflow-hidden">
            <img
              src={SLIDES[current].image}
              alt={SLIDES[current].title}
              className="w-full h-[80vh] object-cover transition-all duration-500"
            />
            <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center text-center px-4 sm:px-6">
              <span className="bg-white/20 text-white text-xs font-semibold px-3 py-1 rounded-full mb-2 sm:mb-3 border border-white/30">
                {SLIDES[current].badge}
              </span>
              <span className="text-3xl sm:text-4xl mb-2">{SLIDES[current].icon}</span>
              <h3 className="text-white text-lg sm:text-xl font-bold mb-2">{SLIDES[current].title}</h3>
              <p className="text-white/80 text-xs sm:text-sm max-w-xs sm:max-w-md">{SLIDES[current].desc}</p>
            </div>
            <button
              onClick={() => setCurrent((current - 1 + SLIDES.length) % SLIDES.length)}
              className="absolute left-2 sm:left-3 top-1/2 -translate-y-1/2 bg-white/30 hover:bg-white/60 text-white rounded-full w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center text-lg transition"
            >‹</button>
            <button
              onClick={() => setCurrent((current + 1) % SLIDES.length)}
              className="absolute right-2 sm:right-3 top-1/2 -translate-y-1/2 bg-white/30 hover:bg-white/60 text-white rounded-full w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center text-lg transition"
            >›</button>
            {/* Points de navigation à l'intérieur de l'image */}
            <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2">
              {SLIDES.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrent(i)}
                  className={`h-2.5 rounded-full transition-all duration-300 ${i === current ? 'bg-white w-5' : 'bg-white/40 w-2.5'}`}
                />
              ))}
            </div>
          </div>
        </section>

        <section className="relative bg-blue-50 border-t border-blue-100">
          <div className="absolute inset-0" style={{ background: 'rgba(54, 88, 160, 0.31)' }} />
          <div className="max-w-2xl mx-auto px-4 py-12 text-center">
            {user ? (
              <>
                <h2 className="text-xl font-semibold text-blue-800 mb-2">Bienvenue, {user.prenom} !</h2>
                <p className="text-sm text-blue-600 mb-6">Gerez vos colocations et annonces depuis votre tableau de bord.</p>
                <Link href="/dashboard" className="px-8 py-3 text-base font-semibold rounded-2xl text-white bg-blue-700 hover:bg-blue-800 transition-all inline-block">Aller au tableau de bord</Link>
              </>
            ) : (
              <>
                <h2 className="text-xl font-semibold text-green-700 mb-2">Prêt à trouver votre Coloc ?</h2>
                <p className="text-sm text-black-800 mb-6">Rejoignez des centaines d'étudiants béninois déjà inscrits.</p>
                <Link href="/auth/register" className="px-8 py-3 text-base font-semibold rounded-2xl text-white bg-blue-700 hover:bg-blue-800 transition-all inline-block">S'inscrire gratuitement</Link>
              </>
            )}
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}











