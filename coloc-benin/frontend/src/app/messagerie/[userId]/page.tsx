'use client';
import { useEffect, useState, useRef } from 'react';
import { useParams } from 'next/navigation';
import { messagerieApi } from '../../../lib/api';
import { Message } from '../../../types';
import { useAuth } from '../../../hooks/useAuth';
import { Navbar } from '../../../components/layout/Navbar';
import clsx from 'clsx';

export default function ConversationPage() {
  const { userId } = useParams<{ userId: string }>();
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [contenu, setContenu] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  const charger = () => {
    messagerieApi.messages(userId)
      .then(r => { setMessages(r.data); setLoading(false); })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    charger();
    // Recharger les messages toutes les 3 secondes
    // ✅ Nouveau
    const interval = setInterval(charger, 10000); return () => clearInterval(interval); // Nettoyer au démontage
  }, [userId]);
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleEnvoyer = async () => {
    if (!contenu.trim() || sending) return;
    setSending(true);
    try {
      const { data } = await messagerieApi.envoyer(userId, contenu.trim());
      setMessages(prev => [...prev, data]);
      setContenu('');
    } finally {
      setSending(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleEnvoyer(); }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center text-gray-400">Chargement...</div>;

  const interlocuteur = messages.find(m => m.expediteur.id !== user?.id)?.expediteur
    || messages[0]?.expediteur;

  return (
    <>
      <Navbar />
      <div className="max-w-2xl mx-auto flex flex-col" style={{ height: 'calc(100vh - 56px)' }}>
        {/* Header conversation */}
        {interlocuteur && (
          <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-100 bg-white">
            {interlocuteur.photo
              ? <img src={interlocuteur.photo} alt="" className="w-9 h-9 rounded-full object-cover" />
              : <span className="w-9 h-9 rounded-full bg-primary-100 text-primary-600 flex items-center justify-center text-sm font-medium">
                {interlocuteur.prenom[0]}{interlocuteur.nom[0]}
              </span>
            }
            <div>
              <p className="text-sm font-medium">{interlocuteur.prenom} {interlocuteur.nom}</p>
            </div>
          </div>
        )}

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 bg-gray-50">
          {messages.length === 0 && (
            <p className="text-center text-gray-400 text-sm mt-8">Démarrez la conversation</p>
          )}
          {messages.map(msg => {
            const isMe = msg.expediteur.id === user?.id;
            return (
              <div key={msg.id} className={clsx('flex', isMe ? 'justify-end' : 'justify-start')}>
                <div className={clsx(
                  'max-w-xs md:max-w-sm px-4 py-2.5 rounded-2xl text-sm',
                  isMe
                    ? 'bg-primary-400 text-white rounded-br-sm'
                    : 'bg-white border border-gray-100 text-gray-900 rounded-bl-sm'
                )}>
                  <p>{msg.contenu}</p>
                  <p className={clsx('text-xs mt-1', isMe ? 'text-primary-200' : 'text-gray-400')}>
                    {new Date(msg.createdAt).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            );
          })}
          <div ref={bottomRef} />
        </div>

        {/* Zone de saisie */}
        <div className="px-4 py-3 bg-white border-t border-gray-100 flex gap-2">
          <textarea
            value={contenu}
            onChange={e => setContenu(e.target.value)}
            onKeyDown={handleKeyDown}
            rows={1}
            className="input flex-1 resize-none text-sm"
            placeholder="Votre message..."
            style={{ maxHeight: '100px', overflowY: 'auto' }}
          />
          <button
            onClick={handleEnvoyer}
            disabled={!contenu.trim() || sending}
            className="btn-primary px-4 text-sm self-end"
          >
            Envoyer

            console.log('Envoi media:', mediaPreview?.file.name, 'vers userId:', userId);
          </button>
        </div>
      </div>
    </>
  );
}
