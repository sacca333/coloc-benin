'use client';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { authApi } from '../../../lib/api';
import { useAuthStore } from '../../../lib/store/auth.store';
import api from '../../../lib/api';

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuthStore();
  const [serverError, setServerError] = useState('');
  const [showForgot, setShowForgot] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotSuccess, setForgotSuccess] = useState('');
  const [forgotError, setForgotError] = useState('');

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

  const handleForgotPassword = async () => {
    if (!forgotEmail.trim()) { setForgotError('Veuillez entrer votre email'); return; }
    setForgotLoading(true);
    setForgotError('');
    try {
      await api.post('/auth/forgot-password', { email: forgotEmail });
      setForgotSuccess('Un lien de réinitialisation a été envoyé à votre adresse email.');
    } catch (err: any) {
      setForgotError(err.response?.data?.error || 'Erreur lors de l envoi');
    } finally {
      setForgotLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Navbar */}
      <nav className="bg-sky-800 h-14 flex items-center px-6">
        <Link href="/" className="flex items-center gap-2">
          <img src="/logo.png" alt="logo" className="w-10 h-12 rounded-xl object-cover" />
          <span className="font-bold text-lg">
            <span className="text-green-400">Coloc</span>
            <span className="text-yellow-400">Bénin</span>
          </span>
        </Link>
      </nav>

      <div className="flex-1 flex items-center justify-center px-4 py-8">
        <div className="card max-w-sm w-full">

          {/* Logo + titre */}
          <div className="mb-6 text-center">
            <img src="/logo.png" alt="logo" className="w-12 h-12 rounded-xl object-cover mx-auto mb-3" />
            <span className="text-2xl font-bold">
              <span className="text-green-600">Coloc</span>
              <span className="text-yellow-500">Bénin</span>
            </span>
            <p className="text-sm text-gray-500 mt-1">
              {showForgot ? 'Réinitialiser votre mot de passe' : 'Connectez-vous à votre compte'}
            </p>
          </div>

          {/* Formulaire mot de passe oublié */}
          {showForgot ? (
            <div>
              {forgotSuccess ? (
                <div className="p-4 bg-teal-50 text-teal-700 text-sm rounded-xl border border-teal-100 mb-4">
                  ✅ {forgotSuccess}
                </div>
              ) : (
                <>
                  {forgotError && (
                    <div className="mb-4 p-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-100">
                      ❌ {forgotError}
                    </div>
                  )}
                  <p className="text-sm text-gray-600 mb-4">
                    Entrez votre adresse email et nous vous enverrons un lien pour réinitialiser votre mot de passe.
                  </p>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <input
                      type="email"
                      value={forgotEmail}
                      onChange={e => setForgotEmail(e.target.value)}
                      className="input"
                      placeholder="votre@email.bj"
                    />
                  </div>
                  <button
                    onClick={handleForgotPassword}
                    disabled={forgotLoading}
                    className="btn-primary w-full mb-3"
                  >
                    {forgotLoading ? 'Envoi en cours...' : 'Envoyer le lien'}
                  </button>
                </>
              )}
              <button
                onClick={() => { setShowForgot(false); setForgotSuccess(''); setForgotError(''); setForgotEmail(''); }}
                className="w-full text-center text-sm text-gray-500 hover:text-gray-700"
              >
                ← Retour à la connexion
              </button>
            </div>
          ) : (
            /* Formulaire connexion */
            <>
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
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-sm font-medium text-gray-700">Mot de passe</label>
                    <button
                      type="button"
                      onClick={() => setShowForgot(true)}
                      className="text-xs text-blue-600 hover:underline"
                    >
                      Mot de passe oublié ?
                    </button>
                  </div>
                  <input {...register('motDePasse', { required: true })} type="password" className="input" />
                </div>
                <button type="submit" disabled={isSubmitting} className="btn-primary w-full">
                  {isSubmitting ? 'Connexion...' : 'Se connecter'}
                </button>
              </form>

              <p className="text-center text-sm text-gray-500 mt-4">
                Pas encore de compte ?{' '}
                <Link href="/auth/register" className="text-blue-600 hover:underline font-medium">S'inscrire</Link>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
