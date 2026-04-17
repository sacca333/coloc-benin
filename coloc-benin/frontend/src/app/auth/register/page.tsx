'use client';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { authApi } from '../../../lib/api';

const schema = z.object({
  nom: z.string().min(2, 'Nom requis'),
  prenom: z.string().min(2, 'Prénom requis'),
  email: z.string().email('Email invalide'),
  motDePasse: z.string().min(8, 'Minimum 8 caractères'),
  telephone: z.string().optional(),
  ville: z.string().optional(),
  universite: z.string().optional(),
  filiere: z.string().optional(),
  niveau: z.enum(['Licence 1', 'Licence 2', 'Licence 3', 'Master 1', 'Master 2', 'Doctorat', 'BTS', 'Autre']).optional(),
});

type FormData = z.infer<typeof schema>;

const NIVEAUX = ['Licence 1', 'Licence 2', 'Licence 3', 'Master 1', 'Master 2', 'Doctorat', 'BTS', 'Autre'];

export default function RegisterPage() {
  const router = useRouter();
  const [success, setSuccess] = useState(false);
  const [serverError, setServerError] = useState('');

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    setServerError('');
    try {
      await authApi.register(data);
      setSuccess(true);
    } catch (err: any) {
      setServerError(err.response?.data?.error || 'Erreur lors de l\'inscription');
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50">
        <div className="card max-w-md w-full">
          <div className="w-12 h-12 bg-teal-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-6 h-6 text-teal-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-lg font-semibold mb-2 text-center">Compte créé !</h2>

          <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 mb-4">
            <p className="text-sm text-gray-700 mb-3">
              <strong>Vérification requise :</strong>
            </p>
            <ol className="text-sm text-gray-600 space-y-2 list-decimal list-inside">
              <li>Vérifiez votre boîte mail (et le dossier spam)</li>
              <li>Cliquez sur le lien de confirmation</li>
              <li>Vous pourrez alors vous connecter</li>
            </ol>
          </div>

          <p className="text-xs text-gray-500 text-center mb-4">
            N'avez pas reçu l'email ? Vérifiez votre dossier spam ou l'adresse saisie.
          </p>

          <Link href="/auth/login" className="btn-primary block text-center text-sm w-full">
            J'ai cliqué sur le lien — Se connecter
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50">
      <div className="card max-w-lg w-full">
        <div className="mb-6">
          <h1 className="text-xl font-semibold">Créer un compte</h1>
          <p className="text-sm text-gray-500 mt-1">Rejoignez ColocBénin et trouvez votre colocation</p>
        </div>

        {serverError && (
          <div className="mb-4 p-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-100">
            {serverError}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Prénom</label>
              <input {...register('prenom')} className="input" placeholder="Koffi" />
              {errors.prenom && <p className="text-xs text-red-500 mt-1">{errors.prenom.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nom</label>
              <input {...register('nom')} className="input" placeholder="Agossou" />
              {errors.nom && <p className="text-xs text-red-500 mt-1">{errors.nom.message}</p>}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input {...register('email')} type="email" className="input" placeholder="koffi@etudiant.bj" />
            {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Mot de passe</label>
            <input {...register('motDePasse')} type="password" className="input" placeholder="Min. 8 caractères" />
            {errors.motDePasse && <p className="text-xs text-red-500 mt-1">{errors.motDePasse.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Téléphone (optionnel)</label>
            <input {...register('telephone')} className="input" placeholder="+229 97000000" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Ville</label>
              <input {...register('ville')} className="input" placeholder="Cotonou" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Niveau</label>
              <select {...register('niveau')} className="input">
                <option value="">Choisir...</option>
                {NIVEAUX.map(n => <option key={n} value={n}>{n}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Université / École</label>
            <input {...register('universite')} className="input" placeholder="UAC, EPAC, HECM..." />
          </div>

          <button type="submit" disabled={isSubmitting} className="btn-primary w-full mt-2">
            {isSubmitting ? 'Création en cours...' : 'Créer mon compte'}
          </button>

          <p className="text-center text-sm text-gray-500">
            Déjà un compte ?{' '}
            <Link href="/auth/login" className="text-primary-600 hover:underline font-medium">
              Se connecter
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
