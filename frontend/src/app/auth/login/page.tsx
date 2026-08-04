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
  const [showPassword, setShowPassword] = useState(false);

  const { register, handleSubmit, formState: { isSubmitting } } = useForm<{ email: string; motDePasse: string }>();

  const onSubmit = async ({ email, motDePasse }: { email: string; motDePasse: string }) => {
    setServerError('');
    try {
      const { data } = await authApi.login(email, motDePasse);
      login(data.token, data.utilisateur, data.abonnementActif);
      // Redirection selon le rôle
      if (data.utilisateur.typeCompte === 'ADMIN') {
        router.push('/admin');
      } else {
        router.push('/dashboard');
      };
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
          <img src="/logo.png" alt="logo" className="w-8 h-8 rounded-xl object-cover" />
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
                      placeholder="votre@gmail.com"
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

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 bg-white p-6 rounded-xl shadow">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input {...register('email', { required: true })} type="email" className="input" placeholder="votre@gmail.com" />
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
                  <div className="relative">
                    <input
                      {...register('motDePasse', { required: true })}
                      type={showPassword ? 'text' : 'password'}
                      className="input pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? (
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 4.411m0 0L21 21" />
                        </svg>
                      ) : (
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      )}
                    </button>
                  </div>
                </div>



                <button type="submit" disabled={isSubmitting} className="btn-primary bg-blue-500 hover:bg-blue-600 text-white w-full">
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
