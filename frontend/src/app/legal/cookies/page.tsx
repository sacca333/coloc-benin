'use client';
import Link from 'next/link';

export default function CookiesPage() {
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
                <h1 className="text-2xl font-bold text-gray-900 mb-2">Politique de cookies</h1>
                <p className="text-sm text-gray-500 mb-8">Dernière mise à jour : 11 septembre 2026</p>

                <div className="space-y-8 text-gray-700 text-sm leading-relaxed">
                    <section>
                        <h2 className="text-lg font-semibold text-gray-900 mb-3">1. Qu'est-ce qu'un cookie ?</h2>
                        <p className="text-gray-600">
                            Un cookie est un petit fichier texte déposé sur votre appareil (ordinateur, smartphone, tablette) lors de la visite d'un site web. Il
                            permet notamment de mémoriser des informations sur votre visite, comme votre langue ou votre état de connexion. Certaines technologies
                            similaires, comme le stockage local du navigateur (« localStorage »), remplissent une fonction comparable.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-lg font-semibold text-gray-900 mb-3">2. Ce que nous utilisons sur ColocBénin</h2>
                        <p className="mb-2 text-gray-600">
                            ColocBénin utilise principalement le <strong>stockage local (localStorage)</strong> de votre navigateur, et non des cookies au sens
                            strict, pour assurer le fonctionnement de base du service :
                        </p>
                        <ul className="list-disc list-inside space-y-1 text-gray-600">
                            <li><strong>Maintien de connexion :</strong> un identifiant de session (token) est stocké localement pour vous garder connecté sans avoir à ressaisir vos identifiants à chaque visite.</li>
                            <li><strong>Préférences d'affichage :</strong> certains réglages liés à votre navigation peuvent être conservés localement sur votre appareil.</li>
                        </ul>
                        <p className="mt-2 text-gray-600">
                            Ces données restent stockées sur votre appareil et ne sont accessibles qu'au site ColocBénin lui-même ; elles ne sont pas transmises à
                            des régies publicitaires.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-lg font-semibold text-gray-900 mb-3">3. Cookies tiers et publicitaires</h2>
                        <p className="text-gray-600">
                            À la date de dernière mise à jour de cette page, ColocBénin n'utilise <strong>aucun cookie publicitaire ni aucun outil d'analyse tiers</strong> (type
                            Google Analytics ou Facebook Pixel). Si cela venait à changer, notamment pour mesurer l'audience du site ou proposer des contenus
                            personnalisés, cette politique serait mise à jour et, si la loi l'exige, votre consentement préalable serait recueilli via un bandeau dédié.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-lg font-semibold text-gray-900 mb-3">4. Comment gérer ces éléments</h2>
                        <ul className="list-disc list-inside space-y-1 text-gray-600">
                            <li>Vous pouvez supprimer les données de stockage local de ColocBénin à tout moment via les paramètres de votre navigateur (généralement dans les options de confidentialité ou « Effacer les données de navigation »).</li>
                            <li>Supprimer ces données vous déconnectera automatiquement de votre compte, et vous devrez ressaisir vos identifiants lors de votre prochaine visite.</li>
                            <li>La plupart des navigateurs permettent également de bloquer ou de limiter les cookies via leurs réglages de confidentialité.</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-lg font-semibold text-gray-900 mb-3">5. Modifications de cette politique</h2>
                        <p className="text-gray-600">
                            Nous pouvons modifier cette politique de cookies à tout moment, notamment si de nouvelles fonctionnalités nécessitant des cookies
                            (analyse d'audience, publicité) sont ajoutées à la plateforme. La date de dernière mise à jour figure en haut de ce document.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-lg font-semibold text-gray-900 mb-3">6. Contact</h2>
                        <p className="text-gray-600">
                            Pour toute question relative à cette politique, contactez-nous via le footer du site, notre page Facebook ColocBénin, ou par email à
                            contact@colocbenin.com.
                        </p>
                    </section>
                </div>

                <div className="mt-10 flex gap-4">
                    <Link href="/legal/confidentialite" className="text-sm text-blue-600 hover:underline">Politique de confidentialité →</Link>
                    <Link href="/legal/cgu" className="text-sm text-blue-600 hover:underline">Conditions d'utilisation →</Link>
                    <Link href="/" className="text-sm text-gray-500 hover:underline">← Retour à l'accueil</Link>
                </div>
            </main>
        </div>
    );
}