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
  prenom: z.string().min(2, 'Prenom requis'),
  email: z.string().email('Email invalide'),
  motDePasse: z.string().min(8, 'Minimum 8 caracteres'),
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
      setServerError(err.response?.data?.error || 'Erreur lors de l inscription');
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <nav className="bg-sky-800 h-14 flex items-center px-6">
          <Link href="/" className="flex items-center gap-2">
            <img src="/logo.png" alt="logo" className="w-10 h-12 rounded-xl object-cover" />
            <span className="font-bold text-lg"><span className="text-green-400">Coloc</span><span className="text-yellow-400">Bénin</span></span>
          </Link>
        </nav>
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="card max-w-md w-full text-center">
            <div className="w-12 h-12 bg-teal-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-teal-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-lg font-semibold mb-2">Compte créé !</h2>
            <p className="text-sm text-gray-500 mb-4">Verifiez votre boite mail et cliquez sur le lien de confirmation.</p>
            <Link href="/auth/login" className="btn-primary block text-center text-sm w-full">
              Se connecter
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Navbar */}
      <nav className="bg-sky-800 h-14 flex items-center px-6">
        <Link href="/" className="flex items-center gap-2">
          <img src="/logo.png" alt="logo" className="w-8 h-8 rounded-xl object-cover" />
          <span className="font-bold text-lg"><span className="text-green-400">Coloc</span><span className="text-yellow-400">Bénin</span></span>
        </Link>
      </nav>

      <div className="flex-1 flex items-center justify-center p-4 py-8">
        <div className="card max-w-lg w-full">
          <div className="mb-6 text-center">
            <img src="/logo.png" alt="logo" className="w-12 h-12 rounded-xl object-cover mx-auto mb-3" />
            <span className="text-2xl font-bold">
              <span className="text-green-600">Coloc</span>
              <span className="text-yellow-500">Bénin</span>
            </span>
            <h1 className="text-xl font-semibold mt-2">Créer un compte</h1>
            <p className="text-sm text-gray-500 mt-1">Rejoignez ColocBénin et trouvez votre colocation</p>
          </div>

          {serverError && (
            <div className="mb-4 p-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-100">{serverError}</div>
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
              <input {...register('motDePasse')} type="password" className="input" placeholder="Min. 8 caracteres" />
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
              <Link href="/auth/login" className="text-blue-600 hover:underline font-medium">Se connecter</Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
