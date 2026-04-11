'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { annoncesApi } from '../../lib/api';
import { Annonce } from '../../types';
import { Navbar } from '../../components/layout/Navbar';
import { useRequireAuth } from '../../hooks/useAuth';

export default function MesAnnoncesPage() {
    const { user, isLoading } = useRequireAuth();
    const [annonces, setAnnonces] = useState<Annonce[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user) return;

        setLoading(true);
        annoncesApi.lister()
            .then(r => {
            })
            .finally(() => setLoading(false));
    }, [user]);

    if (isLoading || loading) return <div className="min-h-screen flex items-center justify-center text-gray-400">Chargement...</div>;
    if (!user) return null;

    return (
        <>
            <Navbar />
            <main className="max-w-6xl mx-auto px-4 py-8">
                {/* En-tête */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">Mes annonces</h1>
                    <p className="text-gray-500 mt-2">Gérez toutes vos annonces de colocation</p>
                </div>

                {/* Bouton créer annonce */}
                <div className="mb-8">
                    <Link href="/annonces/creer" className="inline-block px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 font-medium transition-colors">
                        + Créer une nouvelle annonce
                    </Link>
                </div>

                {/* Annonces */}
                {annonces.length === 0 ? (
                    <div className="bg-white rounded-xl border border-gray-100 p-12 text-center">
                        <div className="text-4xl mb-3">📋</div>
                        <p className="font-semibold text-gray-900 text-lg">Aucune annonce</p>
                        <p className="text-gray-500 mt-2">Vous n'avez pas encore publié d'annonce</p>
                        <Link href="/annonces/creer" className="inline-block mt-6 px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 font-medium transition-colors">
                            Créer votre première annonce
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {annonces.map((annonce) => (
                            <Link key={annonce.id} href={`/annonces/${annonce.id}`} className="bg-white rounded-xl border border-gray-100 overflow-hidden hover:shadow-md transition-all hover:-translate-y-0.5 block">
                                <div className="aspect-video bg-gray-100 overflow-hidden relative">
                                    {annonce.photos[0] ? (
                                        <img src={annonce.photos[0]} alt="" className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center bg-gray-200">
                                            <span className="text-4xl">📷</span>
                                        </div>
                                    )}
                                </div>
                                <div className="p-4">
                                    <div className="flex items-start justify-between mb-3">
                                        <span className="text-xs px-2 py-1 rounded-full bg-primary-100 text-primary-700 font-medium">
                                            {annonce.type === 'LOGEMENT_DISPONIBLE' ? '🏠 Logement' : '📍 Place'}
                                        </span>
                                        <span className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-700 font-medium">
                                            {annonce.nbPlaces} place{annonce.nbPlaces > 1 ? 's' : ''}
                                        </span>
                                    </div>
                                    <h3 className="font-semibold text-gray-900 text-sm line-clamp-2 mb-2">{annonce.quartier || annonce.adresse}</h3>
                                    <p className="text-xs text-gray-500 mb-3">{annonce.ville}</p>
                                    <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                                        <p className="font-bold text-gray-900">{annonce.loyerTotal.toLocaleString()} FCFA</p>
                                        <span className="text-xs text-primary-600 font-medium">Voir →</span>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </main>
        </>
    );
}
