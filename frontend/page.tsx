'use client';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { authApi } from '../../../lib/api';
import { useAuthStore } from '../../../lib/store/auth.store';

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuthStore();
  const [serverError, setServerError] = useState('');
  const { register, handleSubmit, formState: { isSubmitting } } = useForm<{ email: string; motDePasse: string }>();

  const onSubmit = async ({ email, motDePasse }: { email: string; motDePasse: string }) => {
    setServerError('');
    try {
      const { data } = await authApi.login(email, motDePasse);
      login(data.token, data.utilisateur, data.abonnementActif);
      router.push('/dashboard');
    } catch (err: any) {
      setServerError(err.response?.data?.error || 'Identifiants invalides');
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Navbar simple */}
      <nav className="bg-sky-800 h-14 flex items-center px-6">
        <Link href="/" className="flex items-center gap-2">
          <img src="/logo.png" alt="logo" className="w-8 h-8 rounded-xl object-cover" />
          <span className="font-bold text-lg">
            <span className="text-green-400">Coloc</span>
            <span className="text-yellow-400">Bénin</span>
          </span>
        </Link>
      </nav>

      {/* Formulaire centré */}
      <div className="flex-1 flex items-center justify-center px-4 py-8">
        <div className="card max-w-sm w-full">
          <div className="mb-6 text-center">
            <img src="/logo.png" alt="logo" className="w-12 h-12 rounded-xl object-cover mx-auto mb-3" />
            <span className="text-2xl font-bold">
              <span className="text-green-600">Coloc</span>
              <span className="text-yellow-500">Bénin</span>
            </span>
            <p className="text-sm text-gray-500 mt-1">Connectez-vous à votre compte</p>
          </div>

          {serverError && (
            <div className="mb-4 p-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-100">
              {serverError}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input {...register('email', { required: true })} type="email" className="input" placeholder="votre@email.bj" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Mot de passe</label>
              <input {...register('motDePasse', { required: true })} type="password" className="input" />
            </div>
            <button type="submit" disabled={isSubmitting} className="btn-primary w-full">
              {isSubmitting ? 'Connexion...' : 'Se connecter'}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-4">
            Pas encore de compte ?{' '}
            <Link href="/auth/register" className="text-blue-600 hover:underline font-medium">S inscrire</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
