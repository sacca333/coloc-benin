'use client';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRouter } from 'next/navigation';
import { useRequireAuth } from '../../../hooks/useAuth';
import { Navbar } from '../../../components/layout/Navbar';
import api from '../../../lib/api';

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

export default function CreerAnnoncePage() {
  const { user, isLoading } = useRequireAuth();
  const router = useRouter();
  const [photos, setPhotos] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [equipements, setEquipements] = useState<string[]>([]);
  const [serverError, setServerError] = useState('');

  const { register, handleSubmit, setValue, watch, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { type: 'LOGEMENT_DISPONIBLE', nbPlaces: 2 },
  });

  const toggleEquipement = (eq: string) => {
    const next = equipements.includes(eq) ? equipements.filter(e => e !== eq) : [...equipements, eq];
    setEquipements(next);
    setValue('equipements', next);
  };

  const handlePhotos = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []).slice(0, 5);
    setPhotos(files);
    setPreviews(files.map(f => URL.createObjectURL(f)));
  };

  const onSubmit = async (data: FormData) => {
    setServerError('');
    try {
      const fd = new FormData();
      Object.entries(data).forEach(([k, v]) => {
        if (v !== undefined && v !== null) {
          if (Array.isArray(v)) fd.append(k, JSON.stringify(v));
          else fd.append(k, String(v));
        }
      });
      photos.forEach(p => fd.append('photos', p));
      const { data: annonce } = await api.post('/annonces', fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      router.push(`/annonces/${annonce.id}`);
    } catch (err: any) {
      setServerError(err.response?.data?.error || 'Erreur lors de la création');
    }
  };

  if (isLoading) return <div className="min-h-screen flex items-center justify-center text-gray-400">Chargement...</div>;

  return (
    <>
      <Navbar />
      <main className="max-w-2xl mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-xl font-semibold">Publier une annonce</h1>
          <p className="text-sm text-gray-500 mt-1">Renseignez les informations de votre logement ou place disponible.</p>
        </div>

        {serverError && (
          <div className="mb-4 p-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-100">{serverError}</div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Type */}
          <div className="card">
            <h2 className="font-medium text-sm mb-3">Type d'annonce</h2>
            <div className="grid grid-cols-2 gap-3">
              {([
                ['LOGEMENT_DISPONIBLE', 'Chambre à louer disponible', 'Je propose un logement entier ou des chambres'],
                ['PLACE_EN_COLOCATION', 'Place en colocation', 'Je cherche des colocataires pour rejoindre ma coloc'],
              ] as const).map(([val, label, desc]) => (
                <label key={val} className={`border rounded-xl p-3 cursor-pointer transition-all ${watch('type') === val ? 'border-primary-400 bg-primary-50' : 'border-gray-200 hover:border-gray-300'}`}>
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
                <label className="block text-sm text-gray-700 mb-1">Ville <span className="text-red-400">*</span></label>
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
            <h2 className="font-medium text-sm mb-3">Loyer</h2>
            <input type="hidden" {...register('nbPlaces', { valueAsNumber: true })} />
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm text-gray-700 mb-1">Loyer total (FCFA) <span className="text-red-400">*</span></label>
                <input type="number" {...register('loyerTotal', { valueAsNumber: true })} className="input" placeholder="25000" />
                {errors.loyerTotal && <p className="text-xs text-red-500 mt-1">{errors.loyerTotal.message}</p>}
              </div>
              <div>
                <label className="block text-sm text-gray-700 mb-1">Caution (FCFA)</label>
                <input type="number" {...register('caution', { valueAsNumber: true })} className="input" placeholder="Optionnel" />
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
              placeholder="Décrivez le logement, l'ambiance, les règles de vie, la proximité des commodités..."
            />
          </div>

          {/* Photos */}
          <div className="card">
            <h2 className="font-medium text-sm mb-3">Photos (max 5)</h2>
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              multiple
              onChange={handlePhotos}
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-primary-50 file:text-primary-600 hover:file:bg-primary-100"
            />
            {previews.length > 0 && (
              <div className="flex gap-2 mt-3 flex-wrap">
                {previews.map((src, i) => (
                  <img key={i} src={src} alt="" className="w-20 h-16 object-cover rounded-lg border border-gray-100" />
                ))}
              </div>
            )}
          </div>

          <div className="flex gap-3">
            <button type="button" onClick={() => router.back()} className="btn-outline flex-1">Annuler</button>
            <button type="submit" disabled={isSubmitting} className="btn-primary flex-1">
              {isSubmitting ? 'Publication...' : 'Publier l\'annonce'}
            </button>
          </div>
        </form>
      </main>
    </>
  );
}