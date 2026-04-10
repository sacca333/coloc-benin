'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { colocationsApi } from '../../../../../lib/api';
import { useRequireAuth } from '../../../../../hooks/useAuth';
import { Navbar } from '../../../../../components/layout/Navbar';

export default function AccepterInvitationPage() {
  const { id, token } = useParams<{ id: string; token: string }>();
  const { user, isLoading } = useRequireAuth();
  const router = useRouter();
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const handleAccepter = async () => {
    setStatus('loading');
    try {
      await colocationsApi.accepter(id, token);
      setStatus('success');
      setTimeout(() => router.push(`/colocations/${id}`), 2000);
    } catch (err: any) {
      setStatus('error');
      setMessage(err.response?.data?.error || 'Erreur lors de l\'acceptation');
    }
  };

  useEffect(() => {
    if (!isLoading && user) handleAccepter();
  }, [isLoading, user]);

  if (isLoading) return <div className="min-h-screen flex items-center justify-center text-gray-400">Chargement...</div>;

  return (
    <>
      <Navbar />
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="card max-w-sm w-full text-center py-10">
          {status === 'loading' && <p className="text-gray-400">Traitement de votre invitation...</p>}
          {status === 'success' && (
            <>
              <div className="w-14 h-14 bg-teal-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-7 h-7 text-teal-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="text-lg font-semibold mb-2">Invitation acceptée !</h2>
              <p className="text-sm text-gray-500">Redirection vers votre colocation...</p>
            </>
          )}
          {status === 'error' && (
            <>
              <div className="w-14 h-14 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-7 h-7 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <h2 className="text-lg font-semibold mb-2">Invitation invalide</h2>
              <p className="text-sm text-gray-500 mb-4">{message}</p>
              <a href="/colocations" className="btn-outline text-sm">Mes colocations</a>
            </>
          )}
        </div>
      </div>
    </>
  );
}
