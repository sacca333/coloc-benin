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
        <p className="text-sm text-gray-500 mb-8">Dernière mise à jour : 01 septembre 2026</p>

        <div className="space-y-8 text-gray-700 text-sm leading-relaxed">
          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">0. Qui sommes-nous</h2>
            <p className="mb-2">
              ColocBénin est édité par <strong>TECHMODERN</strong>, entreprise individuelle immatriculée au Registre du Commerce et du Crédit Mobilier
              sous le numéro <strong>RCCM RB/PKO/26 A 31070</strong>, dont l'établissement principal est situé à Parakou, Bénin.
            </p>
            <p className="mb-2">Pour toute question relative à vos données personnelles, vous pouvez nous contacter :</p>
            <ul className="list-disc list-inside space-y-1 text-gray-600">
              <li>Par email : <strong>contact@colocbenin.com</strong></li>
              <li>Via WhatsApp : le numéro affiché dans le pied de page du site</li>
            </ul>
            <p className="mt-2 text-gray-600">
              ColocBénin agit en tant que <strong>responsable du traitement</strong> des données décrites ci-dessous, au sens de la Loi n°2017-20 du 20 avril 2018 portant Code du numérique en République du Bénin.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">1. Données collectées</h2>
            <h3 className="font-medium text-gray-800 mb-2">1.1 Données que vous nous fournissez</h3>
            <ul className="list-disc list-inside space-y-1 text-gray-600">
              <li>Identité : prénom, nom, sexe</li>
              <li>Coordonnées : adresse email, numéro de téléphone</li>
              <li>Profil : ville, université/école, filière, niveau d'études (comptes étudiants) ou profession (autres comptes)</li>
              <li>Photo de profil (facultative)</li>
              <li>Contenu que vous publiez : annonces (y compris photos et, si vous le renseignez, un numéro de téléphone de contact), messages échangés avec d'autres utilisateurs, signalements</li>
              <li>Paiement : numéro de téléphone mobile associé au paiement (MTN MoMo, Moov Money, C'Cash) — aucune donnée bancaire n'est stockée directement sur nos serveurs</li>
            </ul>
            <h3 className="font-medium text-gray-800 mb-2 mt-4">1.2 Données collectées automatiquement</h3>
            <ul className="list-disc list-inside space-y-1 text-gray-600">
              <li>Adresse IP et type de navigateur/appareil</li>
              <li>Pages visitées, actions effectuées et durée de session</li>
              <li>Données de connexion (date, heure)</li>
              <li>Cookies et technologies similaires — voir notre Politique de cookies</li>
            </ul>
            <h3 className="font-medium text-gray-800 mb-2 mt-4">1.3 Partage du numéro de téléphone via la messagerie</h3>
            <p className="text-gray-600">
              Si vous renseignez un numéro de téléphone sur l'une de vos annonces, ce numéro n'est jamais affiché publiquement. Il est transmis automatiquement,
              sous forme de message, à la première personne qui vous contacte au sujet de cette annonce via la messagerie de la plateforme. En renseignant ce
              numéro, vous consentez à ce qu'il soit communiqué de cette manière aux utilisateurs qui vous contactent.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">2. Finalités et bases légales du traitement</h2>
            <ul className="list-disc list-inside space-y-1 text-gray-600">
              <li>Créer et gérer votre compte utilisateur — <em>exécution du contrat</em></li>
              <li>Publier et consulter des annonces de colocation — <em>exécution du contrat</em></li>
              <li>Faciliter la messagerie entre utilisateurs — <em>exécution du contrat</em></li>
              <li>Traiter votre abonnement et les paiements associés — <em>exécution du contrat / obligation légale</em></li>
              <li>Vous envoyer des notifications relatives à votre compte — <em>exécution du contrat</em></li>
              <li>Modérer les contenus et traiter les signalements — <em>intérêt légitime</em></li>
              <li>Améliorer la qualité et la sécurité du service — <em>intérêt légitime</em></li>
              <li>Répondre à vos demandes de support — <em>exécution du contrat / intérêt légitime</em></li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">3. Partage des données</h2>
            <p className="mb-2">Nous ne vendons ni ne louons vos données personnelles à des tiers. Vos données peuvent être partagées uniquement dans les cas suivants :</p>
            <ul className="list-disc list-inside space-y-1 text-gray-600">
              <li>Avec les autres utilisateurs : votre prénom, ville, université (si renseignée) et annonces publiées sont visibles par les autres membres</li>
              <li>Avec nos prestataires techniques d'hébergement, dans la mesure nécessaire à la fourniture du service</li>
              <li>Avec nos prestataires de paiement mobile (MTN, Moov, C'Cash) pour valider les transactions</li>
              <li>En cas d'obligation légale ou de réquisition des autorités compétentes au Bénin</li>
            </ul>
            <p className="mt-2 text-gray-600">
              <strong>Transferts hors du Bénin :</strong> nos serveurs sont hébergés chez le prestataire Railway, aux États-Unis. Vos données sont donc
              susceptibles d'être traitées et stockées en dehors du territoire béninois, chez un hébergeur soumis à des standards de sécurité reconnus.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">4. Durée de conservation</h2>
            <ul className="list-disc list-inside space-y-1 text-gray-600">
              <li>Données de compte : conservées pendant toute la durée de votre inscription, puis supprimées 12 mois après la fermeture de votre compte</li>
              <li>Messages : conservés 24 mois après le dernier échange</li>
              <li>Données de paiement : conservées 5 ans conformément aux obligations légales</li>
              <li>Journaux de connexion : conservés 12 mois</li>
              <li>Signalements et modération : conservés 12 mois après traitement</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">5. Vos droits</h2>
            <ul className="list-disc list-inside space-y-1 text-gray-600">
              <li>Droit d'accès : obtenir une copie de vos données personnelles</li>
              <li>Droit de rectification : corriger des informations inexactes</li>
              <li>Droit à l'effacement : demander la suppression de votre compte et de vos données</li>
              <li>Droit d'opposition : vous opposer au traitement de vos données</li>
              <li>Droit à la limitation du traitement dans certains cas</li>
              <li>Droit à la portabilité : recevoir vos données dans un format structuré</li>
            </ul>
            <p className="mt-2 text-gray-600">
              Pour exercer ces droits, contactez-nous par email à contact@colocbenin.com ou via WhatsApp. Nous nous engageons à répondre dans un délai
              maximal de 30 jours. Vous pouvez également introduire une réclamation auprès de l'Autorité de Protection des Données Personnelles (APDP) du Bénin.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">6. Utilisateurs mineurs</h2>
            <p className="text-gray-600">
              ColocBénin est destiné aux personnes âgées de 18 ans ou plus. Nous ne collectons pas sciemment de données auprès de mineurs. Si vous pensez
              qu'un compte a été créé par une personne mineure, merci de nous le signaler à contact@colocbenin.com.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">7. Sécurité</h2>
            <p className="text-gray-600">Nous mettons en œuvre des mesures techniques et organisationnelles pour protéger vos données : chiffrement des mots de passe (hachage bcrypt), connexions sécurisées (HTTPS), accès restreint aux données en base.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">8. Modifications de cette politique</h2>
            <p className="text-gray-600">
              Nous pouvons modifier cette politique, notamment pour refléter des évolutions légales ou fonctionnelles de la plateforme. En cas de
              modification substantielle, nous vous en informerons par un moyen approprié. La date de dernière mise à jour figure en haut de ce document.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">9. Contact</h2>
            <p className="text-gray-600">Pour toute question relative à cette politique, contactez-nous via le footer du site, notre page Facebook ColocBénin, ou par email à contact@colocbenin.com.</p>
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