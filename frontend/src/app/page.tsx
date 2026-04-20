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



        <section className="w-full bg-white py-10 border-y border-gray-100">
          <div className="max-w-4xl mx-auto px-4 grid grid-cols-3 gap-6 text-center bg-gray-500/5 rounded-lg py-8">
            <div>
              <p className="text-3xl font-bold text-blue-500">500+</p>
              <p className="text-sm text-gray-500 mt-1">Étudiants inscrits</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-blue-500">30+</p>
              <p className="text-sm text-gray-500 mt-1 ">Villes couvertes</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-blue-500">300 FCFA</p>
              <p className="text-sm text-gray-500 mt-1">Par mois seulement</p>
            </div>
          </div>
        </section>

        {/* ---- SECTION TÉMOIGNAGES ---- */}
        <section className="w-full bg-white py-14 bg-gray-700">
          <div className="max-w-5xl mx-auto px-4">
            <h2 className="text-2xl font-bold text-center text-blue-100 mb-2">Ce qu'ils disent de nous</h2>
            <p className="text-center text-gray-500 text-sm mb-10">Des étudiants béninois qui ont trouvé leur colocation grâce à ColocBénin</p>
            <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6">
              {[
                {
                  nom: "Adjobi K.",
                  ville: "Cotonou",
                  texte: "J'ai trouvé ma coloc en moins de 3 jours. La plateforme est simple et les profils sont fiables !",
                  avatar: "👩🏾‍🎓",
                },
                {
                  nom: "Rodrigue M.",
                  ville: "Abomey-Calavi",
                  texte: "Le paiement via MoMo c'est parfait pour nous. Je recommande à tous les étudiants de l'UAC.",
                  avatar: "👨🏾‍🎓",
                },
                {
                  nom: "Fatouma B.",
                  ville: "Parakou",
                  texte: "Super expérience ! J'ai pu discuter avec plusieurs colocataires avant de faire mon choix.",
                  avatar: "👩🏾‍💻",
                },
              ].map(({ nom, ville, texte, avatar }) => (
                <div key={nom} className="bg-blue-50 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all duration-200 hover:-translate-y-1">
                  <span className="text-4xl mb-3 block">{avatar}</span>
                  <p className="text-sm text-gray-600 leading-relaxed mb-4">"{texte}"</p>
                  <div>
                    <p className="font-semibold text-blue-800 text-sm">{nom}</p>
                    <p className="text-xs text-gray-400">{ville}</p>
                  </div>
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
              className="w-full h-[60vh] object-cover transition-all duration-500"
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
                <Link href="/auth/register" className="px-8 py-3 text-base font-semibold rounded-2xl text-white bg-blue-700 hover:bg-blue-800 transition-all inline-block">S inscrire gratuitement</Link>
              </>
            )}
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}











