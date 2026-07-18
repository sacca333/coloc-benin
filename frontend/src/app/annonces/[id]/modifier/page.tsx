'use client';
import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '../../../../hooks/useAuth';
import { Navbar } from '../../../../components/layout/Navbar';
import api, { annoncesApi } from '../../../../lib/api';

const schema = z.object({
    type: z.enum(['LOGEMENT_DISPONIBLE', 'PLACE_EN_COLOCATION']),
    ville: z.string().min(2, 'Ville requise'),
    adresse: z.string().optional(),
    quartier: z.string().optional(),
    loyerTotal: z.number({ invalid_type_error: 'Montant requis' }).min(1),
    nbPlaces: z.number().min(2).max(10),
    caution: z.number().optional(),
    description: z.string().optional(),
    equipements: z.array(z.string()).optional(),
});

type FormData = z.infer<typeof schema>;

const VILLES = ['Cotonou', 'Porto-Novo', 'Parakou', 'Abomey-Calavi', 'Bohicon', 'Natitingou', 'Ouidah', 'Lokossa'];
const EQUIPEMENTS_LISTE = ['wifi', 'eau', 'électricité', 'cuisine', 'meublé', 'transport', 'gardien', 'parking'];

export default function ModifierAnnoncePage() {
    const { id } = useParams<{ id: string }>();
    const { user } = useAuth();
    const router = useRouter();
    const [equipements, setEquipements] = useState<string[]>([]);
    const [serverError, setServerError] = useState('');
    const [loading, setLoading] = useState(true);

    const { register, handleSubmit, setValue, watch, reset, formState: { errors, isSubmitting } } = useForm<FormData>({
        resolver: zodResolver(schema),
    });

    useEffect(() => {
        annoncesApi.getById(id).then(r => {
            const a = r.data;
            // Vérifier que c'est bien le propriétaire
            if (user && a.proprietaire.id !== user.id) {
                router.push(`/annonces/${id}`);
                return;
            }
            reset({
                type: a.type,
                ville: a.ville,
                adresse: a.adresse || '',
                quartier: a.quartier || '',
                loyerTotal: a.loyerTotal,
                nbPlaces: a.nbPlaces,
                caution: a.caution || undefined,
                description: a.description || '',
                equipements: a.equipements || [],
            });
            setEquipements(a.equipements || []);
        }).finally(() => setLoading(false));
    }, [id, user]);

    const toggleEquipement = (eq: string) => {
        const next = equipements.includes(eq)
            ? equipements.filter(e => e !== eq)
            : [...equipements, eq];
        setEquipements(next);
        setValue('equipements', next);
    };

    const onSubmit = async (data: FormData) => {
        setServerError('');
        try {
            await api.put(`/annonces/${id}`, data);
            router.push(`/annonces/${id}`);
        } catch (err: any) {
            setServerError(err.response?.data?.error || 'Erreur lors de la modification');
        }
    };

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center text-gray-400">Chargement...</div>
    );

    return (
        <>
            <Navbar />
            <main className="max-w-2xl mx-auto px-4 py-8">
                <div className="mb-6">
                    <h1 className="text-xl font-semibold">Modifier l'annonce</h1>
                    <p className="text-sm text-gray-500 mt-1">Mettez à jour les informations de votre annonce.</p>
                </div>

                {serverError && (
                    <div className="mb-4 p-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-100">
                        {serverError}
                    </div>
                )}

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                    {/* Type */}
                    <div className="card">
                        <h2 className="font-medium text-sm mb-3">Type d'annonce</h2>
                        <div className="grid grid-cols-2 gap-3">
                            {([
                                ['LOGEMENT_DISPONIBLE', 'Logement disponible', 'Je propose un logement entier ou des chambres'],
                                ['PLACE_EN_COLOCATION', 'Place en colocation', 'Je cherche des colocataires pour rejoindre ma coloc'],
                            ] as const).map(([val, label, desc]) => (
                                <label
                                    key={val}
                                    className={`border rounded-xl p-3 cursor-pointer transition-all ${watch('type') === val
                                            ? 'border-primary-400 bg-primary-50'
                                            : 'border-gray-200 hover:border-gray-300'
                                        }`}
                                >
                                    <input type="radio" value={val} {...register('type')} className="sr-only" />
                                    <p className="font-medium text-sm text-gray-900">{label}</p>
                                    <p className="text-xs text-gray-500 mt-0.5">{desc}</p>
                                </label>
                            ))}
                        </div>
                    </div>

                    {/* Localisation */}
                    <div className="card">
                        <h2 className="font-medium text-sm mb-3">Localisation</h2>
                        <div className="space-y-3">
                            <div>
                                <label className="block text-sm text-gray-700 mb-1">
                                    Ville <span className="text-red-400">*</span>
                                </label>
                                <select {...register('ville')} className="input">
                                    <option value="">Sélectionner une ville</option>
                                    {VILLES.map(v => <option key={v} value={v}>{v}</option>)}
                                </select>
                                {errors.ville && <p className="text-xs text-red-500 mt-1">{errors.ville.message}</p>}
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-sm text-gray-700 mb-1">Quartier</label>
                                    <input {...register('quartier')} className="input" placeholder="Ex : Cadjehoun" />
                                </div>
                                <div>
                                    <label className="block text-sm text-gray-700 mb-1">Adresse</label>
                                    <input {...register('adresse')} className="input" placeholder="Rue, carrefour..." />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Loyer */}
                    <div className="card">
                        <h2 className="font-medium text-sm mb-3">Loyer & places</h2>
                        <div className="grid grid-cols-3 gap-3">
                            <div>
                                <label className="block text-sm text-gray-700 mb-1">
                                    Loyer total (FCFA) <span className="text-red-400">*</span>
                                </label>
                                <input
                                    type="number"
                                    {...register('loyerTotal', { valueAsNumber: true })}
                                    className="input"
                                    placeholder="25000"
                                />
                                {errors.loyerTotal && <p className="text-xs text-red-500 mt-1">{errors.loyerTotal.message}</p>}
                            </div>
                            <div>
                                <label className="block text-sm text-gray-700 mb-1">
                                    Nb de places <span className="text-red-400">*</span>
                                </label>
                                <input
                                    type="number"
                                    min={2}
                                    max={10}
                                    {...register('nbPlaces', { valueAsNumber: true })}
                                    className="input"
                                />
                                {errors.nbPlaces && <p className="text-xs text-red-500 mt-1">{errors.nbPlaces.message}</p>}
                            </div>
                            <div>
                                <label className="block text-sm text-gray-700 mb-1">Caution (FCFA)</label>
                                <input
                                    type="number"
                                    {...register('caution', { valueAsNumber: true })}
                                    className="input"
                                    placeholder="Optionnel"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Équipements */}
                    <div className="card">
                        <h2 className="font-medium text-sm mb-3">Équipements disponibles</h2>
                        <div className="flex flex-wrap gap-2">
                            {EQUIPEMENTS_LISTE.map(eq => (
                                <button
                                    key={eq}
                                    type="button"
                                    onClick={() => toggleEquipement(eq)}
                                    className={`px-3 py-1.5 rounded-full text-sm border transition-colors ${equipements.includes(eq)
                                            ? 'bg-primary-400 text-white border-primary-400'
                                            : 'border-gray-200 text-gray-600 hover:border-primary-300'
                                        }`}
                                >
                                    {eq}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Description */}
                    <div className="card">
                        <h2 className="font-medium text-sm mb-3">Description</h2>
                        <textarea
                            {...register('description')}
                            rows={4}
                            className="input resize-none"
                            placeholder="Décrivez le logement, l'ambiance, les règles de vie..."
                        />
                    </div>

                    <div className="flex gap-3">
                        <button
                            type="button"
                            onClick={() => router.back()}
                            className="btn-outline flex-1"
                        >
                            Annuler
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="btn-primary flex-1"
                        >
                            {isSubmitting ? 'Enregistrement...' : 'Enregistrer les modifications'}
                        </button>
                    </div>
                </form>
            </main>
        </>
    );
}
