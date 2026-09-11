'use client';
import Link from 'next/link';

export default function CGUPage() {
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
                <h1 className="text-2xl font-bold text-gray-900 mb-2">Conditions Générales d'Utilisation</h1>
                <p className="text-sm text-gray-500 mb-8">Dernière mise à jour : 11 septembre 2026</p>

                <div className="space-y-8 text-gray-700 text-sm leading-relaxed">
                    <section>
                        <h2 className="text-lg font-semibold text-gray-900 mb-3">1. Objet et éditeur</h2>
                        <p className="text-gray-600">
                            Les présentes Conditions Générales d'Utilisation (« CGU ») régissent l'accès et l'utilisation de la plateforme ColocBénin, accessible à
                            l'adresse colocbenin.com, éditée par <strong>TECHMODERN</strong>, entreprise individuelle immatriculée au Registre du Commerce et du Crédit
                            Mobilier sous le numéro <strong>RCCM RB/PKO/26 A 31070</strong>, dont l'établissement principal est situé à Parakou, Bénin (ci-après « ColocBénin », « nous »).
                        </p>
                        <p className="mt-2 text-gray-600">
                            ColocBénin est une plateforme de mise en relation permettant aux utilisateurs de publier et de consulter des annonces de logement ou de
                            colocation, et d'échanger entre eux via une messagerie intégrée.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-lg font-semibold text-gray-900 mb-3">2. Acceptation des CGU</h2>
                        <p className="text-gray-600">
                            En créant un compte ou en utilisant la plateforme, vous acceptez sans réserve les présentes CGU. Si vous n'acceptez pas ces conditions,
                            vous ne devez pas utiliser ColocBénin.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-lg font-semibold text-gray-900 mb-3">3. Éligibilité</h2>
                        <ul className="list-disc list-inside space-y-1 text-gray-600">
                            <li>Vous devez être âgé d'au moins 18 ans pour créer un compte sur ColocBénin.</li>
                            <li>Les informations fournies lors de l'inscription (nom, email, ville, université, etc.) doivent être exactes et à jour.</li>
                            <li>Un utilisateur ne peut créer qu'un seul compte personnel.</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-lg font-semibold text-gray-900 mb-3">4. Compte utilisateur</h2>
                        <p className="text-gray-600">
                            Vous êtes responsable de la confidentialité de votre mot de passe et de toute activité effectuée depuis votre compte. Contactez-nous
                            immédiatement à <strong>contact@colocbenin.com</strong> si vous suspectez un accès non autorisé à votre compte.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-lg font-semibold text-gray-900 mb-3">5. Publication d'annonces</h2>
                        <ul className="list-disc list-inside space-y-1 text-gray-600">
                            <li>La publication d'une annonce est gratuite et illimitée.</li>
                            <li>Vous êtes seul responsable de l'exactitude, de la légalité et du contenu des annonces que vous publiez (description, photos, prix, disponibilité, numéro de téléphone le cas échéant).</li>
                            <li>ColocBénin ne vérifie pas systématiquement l'exactitude des annonces ni l'identité des propriétaires et n'est pas partie aux accords conclus entre utilisateurs.</li>
                            <li>Nous nous réservons le droit de modérer, suspendre ou supprimer toute annonce non conforme aux présentes CGU, sans préavis.</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-lg font-semibold text-gray-900 mb-3">6. Abonnement et paiement</h2>
                        <ul className="list-disc list-inside space-y-1 text-gray-600">
                            <li>La consultation et la publication d'annonces sont gratuites.</li>
                            <li>Contacter un autre utilisateur via la messagerie nécessite un abonnement payant, dont le tarif est affiché sur la page d'abonnement au moment de la souscription.</li>
                            <li>Les paiements sont traités via les services de paiement mobile MTN MoMo, Moov Money ou C'Cash. ColocBénin ne stocke aucune donnée bancaire.</li>
                            <li>Sauf erreur de facturation avérée, les sommes versées ne sont pas remboursables.</li>
                            <li>Nous nous réservons le droit de modifier les tarifs de l'abonnement, moyennant une information préalable des utilisateurs.</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-lg font-semibold text-gray-900 mb-3">7. Messagerie et comportement des utilisateurs</h2>
                        <p className="mb-2 text-gray-600">En utilisant la messagerie de ColocBénin, vous vous engagez à :</p>
                        <ul className="list-disc list-inside space-y-1 text-gray-600">
                            <li>Communiquer de manière respectueuse et de bonne foi avec les autres utilisateurs</li>
                            <li>Ne pas envoyer de contenu illégal, injurieux, discriminatoire, frauduleux ou à caractère sexuel non sollicité</li>
                            <li>Ne pas harceler ou importuner un autre utilisateur, y compris après un blocage</li>
                            <li>Ne pas utiliser la messagerie à des fins de démarchage commercial non lié à un logement</li>
                        </ul>
                        <p className="mt-2 text-gray-600">
                            Vous pouvez à tout moment bloquer ou signaler un utilisateur dont le comportement vous paraît inapproprié, directement depuis l'application.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-lg font-semibold text-gray-900 mb-3">8. Contenus interdits</h2>
                        <p className="mb-2 text-gray-600">Il est strictement interdit de publier ou de transmettre via ColocBénin :</p>
                        <ul className="list-disc list-inside space-y-1 text-gray-600">
                            <li>Une annonce fictive, trompeuse ou concernant un bien dont vous n'avez pas le droit de disposer</li>
                            <li>Un contenu à caractère raciste, discriminatoire, violent ou pornographique</li>
                            <li>Un contenu portant atteinte aux droits d'un tiers (image, propriété intellectuelle, vie privée)</li>
                            <li>Toute tentative d'escroquerie, de phishing ou de démarchage frauduleux</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-lg font-semibold text-gray-900 mb-3">9. Modération et sanctions</h2>
                        <p className="text-gray-600">
                            En cas de non-respect des présentes CGU, nous nous réservons le droit, sans préavis ni indemnité, de supprimer le contenu concerné,
                            de suspendre temporairement ou de résilier définitivement le compte de l'utilisateur concerné.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-lg font-semibold text-gray-900 mb-3">10. Rôle d'intermédiaire et limitation de responsabilité</h2>
                        <ul className="list-disc list-inside space-y-1 text-gray-600">
                            <li>ColocBénin est une plateforme de mise en relation. Nous ne sommes ni propriétaire, ni locataire, ni partie à un contrat de bail ou de colocation conclu entre utilisateurs.</li>
                            <li>Nous ne garantissons pas l'exactitude des annonces, la fiabilité des utilisateurs, ni l'issue d'une mise en relation.</li>
                            <li>Nous vous recommandons vivement de visiter un logement en personne et de vérifier l'identité de votre interlocuteur avant tout versement d'argent (caution, loyer, avance).</li>
                            <li>Dans la limite permise par la loi béninoise, ColocBénin ne pourra être tenu responsable des litiges, préjudices ou pertes financières résultant d'une mise en relation effectuée via la plateforme.</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-lg font-semibold text-gray-900 mb-3">11. Propriété intellectuelle</h2>
                        <p className="text-gray-600">
                            La marque ColocBénin, son logo, son design et son code source sont la propriété de TECHMODERN. Les contenus que vous publiez (annonces,
                            photos, messages) restent votre propriété ; vous nous accordez une licence non exclusive pour les afficher et les héberger dans le cadre
                            du fonctionnement du service.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-lg font-semibold text-gray-900 mb-3">12. Résiliation</h2>
                        <p className="text-gray-600">
                            Vous pouvez supprimer votre compte à tout moment depuis les paramètres de votre profil ou en nous contactant. La suppression entraîne le
                            retrait de vos annonces et données personnelles, conformément à notre <Link href="/legal/confidentialite" className="text-blue-600 hover:underline">Politique de confidentialité</Link>.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-lg font-semibold text-gray-900 mb-3">13. Droit applicable et litiges</h2>
                        <p className="text-gray-600">
                            Les présentes CGU sont soumises au droit béninois. Tout litige relatif à leur interprétation ou à leur exécution relève de la compétence
                            exclusive des juridictions béninoises, à défaut de résolution amiable préalable.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-lg font-semibold text-gray-900 mb-3">14. Modification des CGU</h2>
                        <p className="text-gray-600">
                            Nous pouvons modifier les présentes CGU à tout moment, notamment pour refléter une évolution légale ou fonctionnelle de la plateforme.
                            La date de dernière mise à jour figure en haut de ce document. Nous vous invitons à la consulter régulièrement.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-lg font-semibold text-gray-900 mb-3">15. Contact</h2>
                        <p className="text-gray-600">
                            Pour toute question relative aux présentes CGU, contactez-nous via le footer du site, notre page Facebook ColocBénin, ou par email à
                            contact@colocbenin.com.
                        </p>
                    </section>
                </div>

                <div className="mt-10 flex gap-4">
                    <Link href="/legal/confidentialite" className="text-sm text-blue-600 hover:underline">Politique de confidentialité →</Link>
                    <Link href="/legal/cookies" className="text-sm text-blue-600 hover:underline">Politique de cookies →</Link>
                    <Link href="/" className="text-sm text-gray-500 hover:underline">← Retour à l'accueil</Link>
                </div>
            </main>
        </div>
    );
}