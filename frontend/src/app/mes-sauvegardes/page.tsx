'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRequireAuth } from '../../hooks/useAuth';
import { Navbar } from '../../components/layout/Navbar';
import { sauvegardesApi } from '../../lib/api';
import { Annonce } from '../../types';
import clsx from 'clsx';

export default function MesSauvegardesPage() {
    const { user, isLoading } = useRequireAuth();
    const [annonces, setAnnonces] = useState<Annonce[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user) return;
        sauvegardesApi.lister()
            .then(r => setAnnonces(r.data))
            .finally(() => setLoading(false));
    }, [user]);

    const handleSupprimer = async (annonceId: string) => {
        try {
            await sauvegardesApi.supprimer(annonceId);
            setAnnonces(prev => prev.filter(a => a.id !== annonceId));
        } catch { }
    };

    if (isLoading) return (
        <div className="min-h-screen flex items-center justify-center text-gray-400">Chargement...</div>
    );

    return (
        <>
            <Navbar />
            <main className="max-w-3xl mx-auto px-4 py-8">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h1 className="text-xl font-semibold">Mes sauvegardes</h1>
                        <p className="text-sm text-gray-500 mt-0.5">
                            {annonces.length} annonce{annonces.length > 1 ? 's' : ''} sauvegardée{annonces.length > 1 ? 's' : ''}
                        </p>
                    </div>
                </div>

                {loading ? (
                    <div className="space-y-3">
                        {[1, 2, 3].map(i => <div key={i} className="h-24 rounded-2xl bg-gray-100 animate-pulse" />)}
                    </div>
                ) : annonces.length === 0 ? (
                    <div className="text-center py-16">
                        <p className="text-4xl mb-3">🤍</p>
                        <p className="text-gray-400 text-sm mb-4">Vous n'avez pas encore sauvegardé d'annonce</p>
                        <Link href="/annonces" className="btn-primary text-sm">Parcourir les annonces</Link>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {annonces.map(a => (
                            <div key={a.id} className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm hover:shadow-md transition-all duration-200">
                                <div className="flex gap-4">
                                    <Link href={`/annonces/${a.id}`} className="w-20 h-16 rounded-xl bg-gray-100 flex-shrink-0 overflow-hidden">
                                        {a.photos?.[0]
                                            ? <img src={a.photos[0]} alt="" className="w-full h-full object-cover" />
                                            : <div className="w-full h-full flex items-center justify-center text-gray-300 text-2xl">🏠</div>
                                        }
                                    </Link>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-start justify-between gap-2">
                                            <Link href={`/annonces/${a.id}`} className="flex-1 min-w-0">
                                                <span className={clsx('text-xs px-2 py-0.5 rounded-full font-medium', a.type === 'LOGEMENT_DISPONIBLE' ? 'bg-violet-50 text-violet-600' : 'bg-teal-50 text-teal-600')}>
                                                    {a.type === 'LOGEMENT_DISPONIBLE' ? 'Logement' : 'Place en coloc'}
                                                </span>
                                                <p className="font-medium text-sm mt-1">{a.quartier || a.adresse || a.ville}</p>
                                                <p className="text-xs text-gray-500">{a.ville} · {a.nbPlaces} place{a.nbPlaces > 1 ? 's' : ''}</p>
                                            </Link>
                                            <div className="flex flex-col items-end gap-1 flex-shrink-0">
                                                <p className="font-semibold text-sm">{a.loyerTotal.toLocaleString()} FCFA</p>
                                                <p className="text-xs text-gray-400">/ mois</p>
                                                <button
                                                    onClick={() => handleSupprimer(a.id)}
                                                    className="mt-1 text-xs text-red-400 hover:text-red-600 hover:underline"
                                                >
                                                    Retirer
                                                </button>
                                            </div>
                                        </div>
                                        {a.equipements?.length > 0 && (
                                            <div className="flex flex-wrap gap-1 mt-2">
                                                {a.equipements.slice(0, 4).map(eq => (
                                                    <span key={eq} className="text-xs text-gray-500 bg-gray-50 border border-gray-100 px-1.5 py-0.5 rounded-full">{eq}</span>
                                                ))}
                                                {a.equipements.length > 4 && <span className="text-xs text-gray-400">+{a.equipements.length - 4}</span>}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </main>
        </>
    );
}