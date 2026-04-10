import Link from 'next/link';
import { Navbar } from '../components/layout/Navbar';

export default function HomePage() {
  return (
    <>
      <Navbar />
      <main>
        {/* Hero */}
        <section className="max-w-4xl mx-auto px-4 py-16 text-center">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 leading-tight">
            Trouvez votre colocation
            <span className="text-primary-400"> idéale au Bénin</span>
          </h1>
          <p className="mt-4 text-gray-500 text-base max-w-xl mx-auto">
            La plateforme dédiée aux étudiants béninois pour trouver des colocataires, gérer les loyers et simplifier la vie en communauté.
          </p>
          <div className="mt-8 flex items-center justify-center gap-4 flex-wrap">
            <Link href="/annonces" className="btn-primary px-6 py-3 text-base">
              Voir les annonces
            </Link>
            <Link href="/auth/register" className="btn-outline px-6 py-3 text-base">
              Créer un compte — 300 FCFA/mois
            </Link>
          </div>
        </section>

        {/* Features */}
        <section className="max-w-5xl mx-auto px-4 pb-16">
          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                title: 'Trouvez des colocataires',
                desc: 'Filtrez par ville, université, budget et préférences de vie. Profils d\'étudiants vérifiés.',
              },
              {
                title: 'Discutez et trouvez un accord',
                desc: 'Messagerie intégrée pour échanger et valider votre colocation en toute simplicité.',
              },
              {
                title: 'Payez avec votre mobile',
                desc: 'Abonnement via MTN MoMo, C\'cash ou Moov Money. 300 FCFA/mois seulement.',
              },
            ].map(({ title, desc }) => (
              <div key={title} className="card">
                <h3 className="font-semibold text-gray-900 mb-2">{title}</h3>
                <p className="text-sm text-gray-500">{desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* CTA inscription */}
        <section className="bg-primary-50 border-t border-primary-100">
          <div className="max-w-2xl mx-auto px-4 py-12 text-center">
            <h2 className="text-xl font-semibold text-primary-800 mb-2">Prêt à trouver votre coloc ?</h2>
            <p className="text-sm text-primary-600 mb-6">Rejoignez des centaines d'étudiants béninois déjà inscrits.</p>
            <Link href="/auth/register" className="btn-primary px-8 py-3 text-base inline-block">
              S'inscrire gratuitement
            </Link>
          </div>
        </section>
      </main>

      <footer className="border-t border-gray-100 py-6 text-center text-xs text-gray-400">
        © {new Date().getFullYear()} ColocBénin · Tous droits réservés
      </footer>
    </>
  );
}







