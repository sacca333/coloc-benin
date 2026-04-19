'use client';
import Link from 'next/link';

export default function ConfidentialitePage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-sky-800 h-14 flex items-center px-6">
        <Link href="/" className="flex items-center gap-2">
          <img src="/logo.png" alt="logo" className="w-8 h-8 rounded-xl object-cover" />
          <span className="font-bold text-lg">
            <span className="text-green-400">Coloc</span>
            <span className="text-yellow-400">Bénin</span>
          </span>
        </Link>
      </nav>

      <main className="max-w-3xl mx-auto px-4 py-12">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Politique de confidentialité</h1>
        <p className="text-sm text-gray-500 mb-8">Dernière mise à jour : 18 avril 2026</p>

        <div className="space-y-8 text-gray-700 text-sm leading-relaxed">
          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">1. Données collectées</h2>
            <h3 className="font-medium text-gray-800 mb-2">1.1 Données que vous nous fournissez</h3>
            <ul className="list-disc list-inside space-y-1 text-gray-600">
              <li>Identité : prénom, nom</li>
              <li>Coordonnées : adresse email, numéro de téléphone</li>
              <li>Profil étudiant : université/école, filière, niveau d'études, ville</li>
              <li>Contenu : annonces publiées, messages échangés sur la plateforme</li>
              <li>Paiement : numéro de téléphone mobile associé au paiement (MTN MoMo, Moov Money, C'Cash) — aucune donnée bancaire n'est stockée directement sur nos serveurs</li>
            </ul>
            <h3 className="font-medium text-gray-800 mb-2 mt-4">1.2 Données collectées automatiquement</h3>
            <ul className="list-disc list-inside space-y-1 text-gray-600">
              <li>Adresse IP et type de navigateur</li>
              <li>Pages visitées et durée de session</li>
              <li>Données de connexion (date, heure, appareil)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">2. Utilisation des données</h2>
            <p className="mb-2">Nous utilisons vos données pour :</p>
            <ul className="list-disc list-inside space-y-1 text-gray-600">
              <li>Créer et gérer votre compte utilisateur</li>
              <li>Vous permettre de publier et consulter des annonces de colocation</li>
              <li>Faciliter la messagerie entre colocataires</li>
              <li>Traiter votre abonnement via les services de paiement mobile</li>
              <li>Vous envoyer des notifications relatives à votre compte</li>
              <li>Améliorer la qualité et la sécurité de la plateforme</li>
              <li>Répondre à vos demandes de support</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">3. Partage des données</h2>
            <p className="mb-2">Nous ne vendons ni ne louons vos données personnelles à des tiers. Vos données peuvent être partagées uniquement dans les cas suivants :</p>
            <ul className="list-disc list-inside space-y-1 text-gray-600">
              <li>Avec les autres utilisateurs : votre prénom, ville, université et annonces publiées sont visibles par les autres membres</li>
              <li>Avec nos prestataires de paiement mobile (MTN, Moov, C'Cash) pour valider les transactions</li>
              <li>En cas d'obligation légale ou de réquisition des autorités compétentes au Bénin</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">4. Durée de conservation</h2>
            <ul className="list-disc list-inside space-y-1 text-gray-600">
              <li>Données de compte : conservées pendant toute la durée de votre inscription, puis supprimées 12 mois après la fermeture de votre compte</li>
              <li>Messages : conservés 24 mois après le dernier échange</li>
              <li>Données de paiement : conservées 5 ans conformément aux obligations légales</li>
              <li>Journaux de connexion : conservés 12 mois</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">5. Vos droits</h2>
            <ul className="list-disc list-inside space-y-1 text-gray-600">
              <li>Droit d'accès : obtenir une copie de vos données personnelles</li>
              <li>Droit de rectification : corriger des informations inexactes</li>
              <li>Droit à l'effacement : demander la suppression de votre compte et de vos données</li>
              <li>Droit d'opposition : vous opposer au traitement de vos données</li>
            </ul>
            <p className="mt-2 text-gray-600">Pour exercer ces droits, contactez-nous par email ou via WhatsApp.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">6. Sécurité</h2>
            <p className="text-gray-600">Nous mettons en œuvre des mesures techniques et organisationnelles pour protéger vos données : chiffrement des mots de passe (hachage bcrypt), connexions sécurisées (HTTPS), accès restreint aux données en base.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">7. Contact</h2>
            <p className="text-gray-600">Pour toute question relative à cette politique, contactez-nous via le footer du site ou notre page Facebook ColocBénin.</p>
          </section>
        </div>

        <div className="mt-10 flex gap-4">
          <Link href="/legal/cookies" className="text-sm text-blue-600 hover:underline">Politique de cookies →</Link>
          <Link href="/" className="text-sm text-gray-500 hover:underline">← Retour à l'accueil</Link>
        </div>
      </main>
    </div>
  );
}
