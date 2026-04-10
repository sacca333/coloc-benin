'use client';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { colocationsApi } from '../../../lib/api';
import { useRequireAbonnement } from '../../../hooks/useAuth';
import { Navbar } from '../../../components/layout/Navbar';

const schema = z.object({
  nom:        z.string().min(2, 'Nom requis'),
  ville:      z.string().min(2, 'Ville requise'),
  adresse:    z.string().optional(),
  loyerTotal: z.number({ invalid_type_error: 'Loyer requis' }).min(1),
  nbPlaces:   z.number().min(2).max(10),
  description: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

const VILLES = ['Cotonou', 'Porto-Novo', 'Parakou', 'Abomey-Calavi', 'Bohicon', 'Natitingou', 'Ouidah', 'Lokossa'];

export default function CreerColocPage() {
  const { user, isLoading } = useRequireAbonnement();
  const router = useRouter();
  const [serverError, setServerError] = useState('');

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { nbPlaces: 2 },
  });

  const onSubmit = async (data: FormData) => {
    setServerError('');
    try {
      const { data: coloc } = await colocationsApi.creer(data);
      router.push(`/colocations/${coloc.id}`);
    } catch (err: any) {
      setServerError(err.response?.data?.error || 'Erreur lors de la création');
    }
  };

  if (isLoading) return <div className="min-h-screen flex items-center justify-center text-gray-400">Chargement...</div>;

  return (
    <>
      <Navbar />
      <main className="max-w-xl mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-xl font-semibold">Créer une colocation</h1>
          <p className="text-sm text-gray-500 mt-1">Vous serez automatiquement ajouté comme premier membre.</p>
        </div>

        {serverError && (
          <div className="mb-4 p-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-100">{serverError}</div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div className="card space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nom de la colocation <span className="text-red-400">*</span></label>
              <input {...register('nom')} className="input" placeholder="Ex : Coloc des étudiants de l'UAC" />
              {errors.nom && <p className="text-xs text-red-500 mt-1">{errors.nom.message}</p>}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Ville <span className="text-red-400">*</span></label>
                <select {...register('ville')} className="input">
                  <option value="">Choisir...</option>
                  {VILLES.map(v => <option key={v} value={v}>{v}</option>)}
                </select>
                {errors.ville && <p className="text-xs text-red-500 mt-1">{errors.ville.message}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Quartier / Adresse</label>
                <input {...register('adresse')} className="input" placeholder="Optionnel" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Loyer total (FCFA) <span className="text-red-400">*</span></label>
                <input type="number" {...register('loyerTotal', { valueAsNumber: true })} className="input" placeholder="60000" />
                {errors.loyerTotal && <p className="text-xs text-red-500 mt-1">{errors.loyerTotal.message}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nombre de places <span className="text-red-400">*</span></label>
                <input type="number" min={2} max={10} {...register('nbPlaces', { valueAsNumber: true })} className="input" />
                {errors.nbPlaces && <p className="text-xs text-red-500 mt-1">{errors.nbPlaces.message}</p>}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea {...register('description')} rows={3} className="input resize-none" placeholder="Ambiance, règles, style de vie attendu..." />
            </div>
          </div>

          <div className="p-4 bg-primary-50 rounded-xl border border-primary-100 text-sm text-primary-700">
            La répartition du loyer sera calculée automatiquement entre les membres actifs ({`votre part = loyer total ÷ nombre de membres`}).
          </div>

          <div className="flex gap-3">
            <button type="button" onClick={() => router.back()} className="btn-outline flex-1">Annuler</button>
            <button type="submit" disabled={isSubmitting} className="btn-primary flex-1">
              {isSubmitting ? 'Création...' : 'Créer la colocation'}
            </button>
          </div>
        </form>
      </main>
    </>
  );
}
