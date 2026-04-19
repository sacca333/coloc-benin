'use client';
import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import api from '../../../../lib/api';

export default function ResetPasswordPage() {
  const { token } = useParams<{ token: string }>();
  const router = useRouter();
  const [nouveauMotDePasse, setNouveauMotDePasse] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    setError('');
    if (nouveauMotDePasse.length < 8) { setError('Minimum 8 caracteres'); return; }
    if (nouveauMotDePasse !== confirmation) { setError('Les mots de passe ne correspondent pas'); return; }
    setLoading(true);
    try {
      await api.post(`/auth/reset-password/${token}`, { nouveauMotDePasse });
      setSuccess('Mot de passe reinitialise ! Vous pouvez vous connecter.');
      setTimeout(() => router.push('/auth/login'), 3000);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Lien invalide ou expire');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <nav className="bg-sky-800 h-14 flex items-center px-6">
        <Link href="/" className="flex items-center gap-2">
          <img src="/logo.png" alt="logo" className="w-8 h-8 rounded-xl object-cover" />
          <span className="font-bold text-lg"><span className="text-green-400">Coloc</span><span className="text-yellow-400">Benin</span></span>
        </Link>
      </nav>
      <div className="flex-1 flex items-center justify-center px-4 py-8">
        <div className="card max-w-sm w-full">
          <h2 className="text-lg font-semibold text-gray-900 mb-1">Nouveau mot de passe</h2>
          <p className="text-sm text-gray-500 mb-5">Choisissez un nouveau mot de passe pour votre compte.</p>
          {success && <div className="mb-4 p-3 bg-teal-50 text-teal-700 text-sm rounded-xl border border-teal-100">✅ {success}</div>}
          {error && <div className="mb-4 p-3 bg-red-50 text-red-600 text-sm rounded-xl border border-red-100">❌ {error}</div>}
          {!success && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nouveau mot de passe</label>
                <input type="password" value={nouveauMotDePasse} onChange={e => setNouveauMotDePasse(e.target.value)} className="input" placeholder="Min. 8 caracteres" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Confirmer</label>
                <input type="password" value={confirmation} onChange={e => setConfirmation(e.target.value)} className="input" />
              </div>
              <button onClick={handleSubmit} disabled={loading} className="btn-primary w-full">
                {loading ? 'Reinitialisation...' : 'Reinitialiser le mot de passe'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
