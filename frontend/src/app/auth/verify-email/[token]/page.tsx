'use client';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import api from '../../../../lib/api';

export default function VerifyEmailPage() {
  const { token } = useParams<{ token: string }>();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');

  useEffect(() => {
    api.get(`/auth/verify-email/${token}`)
      .then(() => setStatus('success'))
      .catch(() => setStatus('error'));
  }, [token]);

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50">
      <div className="card max-w-sm w-full text-center py-10">
        {status === 'loading' && (
          <p className="text-gray-400">Vérification en cours...</p>
        )}
        {status === 'success' && (
          <>
            <div className="w-14 h-14 bg-teal-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-7 h-7 text-teal-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-lg font-semibold mb-2">Email vérifié !</h2>
            <p className="text-sm text-gray-500 mb-5">Votre compte est activé. Vous pouvez maintenant vous connecter.</p>
            <Link href="/auth/login" className="btn-primary block text-sm">Se connecter</Link>
          </>
        )}
        {status === 'error' && (
          <>
            <div className="w-14 h-14 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-7 h-7 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h2 className="text-lg font-semibold mb-2">Lien invalide</h2>
            <p className="text-sm text-gray-500 mb-5">Ce lien est expiré ou invalide. Réinscrivez-vous ou contactez le support.</p>
            <Link href="/auth/register" className="btn-outline block text-sm">Retour à l'inscription</Link>
          </>
        )}
      </div>
    </div>
  );
}
