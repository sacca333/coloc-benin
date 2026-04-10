'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { messagerieApi } from '../../lib/api';
import { Navbar } from '../../components/layout/Navbar';
import { useRequireAuth } from '../../hooks/useAuth';
import clsx from 'clsx';

interface Conversation {
  interlocuteur: { id: string; nom: string; prenom: string; photo?: string };
  dernierMessage: { contenu: string; createdAt: string; lu: boolean };
  nonLus: number;
}

export default function MessagerieListePage() {
  const { user, isLoading } = useRequireAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    messagerieApi.conversations()
      .then(r => setConversations(r.data))
      .finally(() => setLoading(false));
  }, [user]);

  if (isLoading || loading) return <div className="min-h-screen flex items-center justify-center text-gray-400">Chargement...</div>;

  return (
    <>
      <Navbar />
      <main className="max-w-2xl mx-auto px-4 py-8">
        <h1 className="text-xl font-semibold mb-6">Messages</h1>

        {conversations.length === 0 ? (
          <div className="card text-center py-12">
            <p className="text-gray-400 text-sm">Aucune conversation pour le moment.</p>
            <p className="text-gray-300 text-xs mt-1">Contactez un propriétaire depuis une annonce pour démarrer.</p>
          </div>
        ) : (
          <div className="card p-0 divide-y divide-gray-50">
            {conversations.map(conv => (
              <Link
                key={conv.interlocuteur.id}
                href={`/messagerie/${conv.interlocuteur.id}`}
                className={clsx('flex items-center gap-3 px-5 py-4 hover:bg-gray-50 transition-colors', conv.nonLus > 0 && 'bg-primary-50/40')}
              >
                <div className="relative flex-shrink-0">
                  {conv.interlocuteur.photo
                    ? <img src={conv.interlocuteur.photo} alt="" className="w-10 h-10 rounded-full object-cover" />
                    : <span className="w-10 h-10 rounded-full bg-primary-100 text-primary-600 flex items-center justify-center text-sm font-medium">
                        {conv.interlocuteur.prenom[0]}{conv.interlocuteur.nom[0]}
                      </span>
                  }
                  {conv.nonLus > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-primary-400 text-white text-xs rounded-full flex items-center justify-center font-medium">
                      {conv.nonLus}
                    </span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className={clsx('text-sm', conv.nonLus > 0 ? 'font-semibold text-gray-900' : 'font-medium text-gray-800')}>
                      {conv.interlocuteur.prenom} {conv.interlocuteur.nom}
                    </p>
                    <p className="text-xs text-gray-400 flex-shrink-0 ml-2">
                      {new Date(conv.dernierMessage.createdAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}
                    </p>
                  </div>
                  <p className={clsx('text-xs truncate mt-0.5', conv.nonLus > 0 ? 'text-gray-700' : 'text-gray-400')}>
                    {conv.dernierMessage.contenu}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
    </>
  );
}
