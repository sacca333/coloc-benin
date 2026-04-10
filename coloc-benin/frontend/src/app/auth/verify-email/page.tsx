'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import api from '@/lib/api';

export default function VerifyEmailPage() {
    const params = useParams();
    const router = useRouter();
    const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
    const [message, setMessage] = useState('');

    useEffect(() => {
        const verifyEmail = async () => {
            try {
                const token = params.token as string;
                if (!token) {
                    setStatus('error');
                    setMessage('Token de vérification manquant');
                    return;
                }

                const response = await api.get(`/auth/verify-email/${token}`);
                setStatus('success');
                setMessage('Email vérifié avec succès ! Vous pouvez maintenant vous connecter.');

                // Redirection automatique après 2 secondes
                setTimeout(() => {
                    router.push('/auth/login');
                }, 2000);
            } catch (err: any) {
                setStatus('error');
                setMessage(err.response?.data?.error || 'Erreur lors de la vérification. Le lien est peut-être expiré.');
            }
        };

        verifyEmail();
    }, [params.token, router]);

    return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50">
            <div className="card max-w-md w-full text-center">
                {status === 'loading' && (
                    <>
                        <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4 animate-spin">
                            <div className="w-6 h-6 border-2 border-blue-400 border-t-transparent rounded-full" />
                        </div>
                        <h2 className="text-lg font-semibold mb-2">Vérification en cours...</h2>
                        <p className="text-sm text-gray-500">Veuillez patienter</p>
                    </>
                )}

                {status === 'success' && (
                    <>
                        <div className="w-12 h-12 bg-teal-50 rounded-full flex items-center justify-center mx-auto mb-4">
                            <svg className="w-6 h-6 text-teal-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                        </div>
                        <h2 className="text-lg font-semibold mb-2">Email vérifié !</h2>
                        <p className="text-sm text-gray-500 mb-4">{message}</p>
                        <p className="text-xs text-gray-400 mb-4">Redirection vers la connexion...</p>
                        <Link href="/auth/login" className="btn-primary block text-center text-sm">
                            Se connecter maintenant
                        </Link>
                    </>
                )}

                {status === 'error' && (
                    <>
                        <div className="w-12 h-12 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
                            <svg className="w-6 h-6 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </div>
                        <h2 className="text-lg font-semibold mb-2">Erreur</h2>
                        <p className="text-sm text-gray-500 mb-4">{message}</p>
                        <Link href="/auth/register" className="btn-primary block text-center text-sm">
                            S'inscrire de nouveau
                        </Link>
                    </>
                )}
            </div>
        </div>
    );
}
