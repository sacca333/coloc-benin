'use client';
import { useEffect, useState, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { messagerieApi } from '../../../lib/api';
import { Message } from '../../../types';
import { useAuth } from '../../../hooks/useAuth';
import { photoUrl } from '../../../lib/api';
import api from '../../../lib/api';
import clsx from 'clsx';

export default function ConversationPage() {
  const { userId } = useParams<{ userId: string }>();
  const router = useRouter();
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [contenu, setContenu] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [optionsOpen, setOptionsOpen] = useState(false);
  const [mediaPreview, setMediaPreview] = useState<{ file: File; url: string } | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const optionsRef = useRef<HTMLDivElement>(null);

  const charger = () => {
    messagerieApi.messages(userId)
      .then(r => { setMessages(r.data); setLoading(false); })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    charger();
    const interval = setInterval(charger, 10000);
    return () => clearInterval(interval);
  }, [userId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (optionsRef.current && !optionsRef.current.contains(e.target as Node)) {
        setOptionsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleEnvoyer = async () => {
    if (sending) return;
    if (!contenu.trim() && !mediaPreview) return;
    setSending(true);
    try {
      if (mediaPreview) {
        const fd = new FormData();
        fd.append('media', mediaPreview.file);
        const token = localStorage.getItem('coloc_token');
        const res = await fetch(`http://localhost:4000/api/messagerie/${userId}/media`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
          body: fd,
        });
        const data = await res.json();
        setMessages(prev => [...prev, data]);
        setMediaPreview(null);
      }
      if (contenu.trim()) {
        const { data } = await messagerieApi.envoyer(userId, contenu.trim());
        setMessages(prev => [...prev, data]);
        setContenu('');
      }
    } finally {
      setSending(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleEnvoyer(); }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setMediaPreview({ file, url });
  };

  const isVideo = (url: string) => url.includes('.mp4') || url.includes('.mov');

  const interlocuteur = messages.find(m => m?.expediteur?.id !== user?.id)?.expediteur;
  const interlocuteurPhoto = photoUrl(interlocuteur?.photo);

  if (loading) return <div className="min-h-screen flex items-center justify-center text-gray-400">Chargement...</div>;

  return (
    <div className="flex flex-col h-screen bg-gray-50">

      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 bg-gray-950 border-b border-gray-800 flex-shrink-0">
        <button onClick={() => router.back()} className="text-gray-400 hover:text-white mr-1">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-5 h-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        {interlocuteurPhoto
          ? <img src={interlocuteurPhoto} alt="" className="w-9 h-9 rounded-full object-cover flex-shrink-0" />
          : <span className="w-9 h-9 rounded-full bg-violet-600 text-white flex items-center justify-center text-sm font-semibold flex-shrink-0">
              {interlocuteur ? `${interlocuteur.prenom[0]}${interlocuteur.nom[0]}` : '?'}
            </span>
        }

        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-white truncate">
            {interlocuteur ? `${interlocuteur.prenom} ${interlocuteur.nom}` : 'Conversation'}
          </p>
          <p className="text-xs text-gray-400">En ligne</p>
        </div>

        {/* Bouton 3 points */}
        <div className="relative" ref={optionsRef}>
          <button
            onClick={() => setOptionsOpen(!optionsOpen)}
            className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-gray-800 transition-colors text-gray-400 hover:text-white"
          >
            <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
              <circle cx="12" cy="5" r="1.5" />
              <circle cx="12" cy="12" r="1.5" />
              <circle cx="12" cy="19" r="1.5" />
            </svg>
          </button>

          {optionsOpen && (
            <div className="absolute right-0 top-11 w-56 bg-gray-900 border border-gray-700 rounded-2xl py-2 shadow-xl z-50">
              <button
                onClick={() => { router.push('/annonces/creer'); setOptionsOpen(false); }}
                className="w-full flex items-center gap-3 px-4 py-3 text-sm text-gray-200 hover:bg-gray-800 transition-colors text-left"
              >
                <span>📋</span>
                <div>
                  <p className="font-medium">Creer une annonce</p>
                  <p className="text-xs text-gray-500">Publier une annonce de colocation</p>
                </div>
              </button>
              <button
                onClick={() => { router.push('/annonces'); setOptionsOpen(false); }}
                className="w-full flex items-center gap-3 px-4 py-3 text-sm text-gray-200 hover:bg-gray-800 transition-colors text-left"
              >
                <span>🤝</span>
                <div>
                  <p className="font-medium">Voir les annonces</p>
                  <p className="text-xs text-gray-500">Trouver une colocation</p>
                </div>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-2">
        {messages.length === 0 && (
          <div className="text-center mt-12">
            <p className="text-4xl mb-2">👋</p>
            <p className="text-gray-400 text-sm">Demarrez la conversation</p>
          </div>
        )}

        {messages.map(msg => {
          const isMe = msg?.expediteur?.id === user?.id;
          const hasMedia = msg.media;
          const isVid = hasMedia && isVideo(msg.media!);

          return (
            <div key={msg.id} className={clsx('flex items-end gap-2', isMe ? 'justify-end' : 'justify-start')}>
              {!isMe && (
                interlocuteurPhoto
                  ? <img src={interlocuteurPhoto} alt="" className="w-6 h-6 rounded-full object-cover flex-shrink-0 mb-1" />
                  : <span className="w-6 h-6 rounded-full bg-violet-600 text-white flex items-center justify-center text-xs flex-shrink-0 mb-1">
                      {interlocuteur?.prenom[0]}
                    </span>
              )}

              <div className={clsx(
                'max-w-xs md:max-w-sm rounded-2xl overflow-hidden',
                isMe ? 'bg-violet-600 text-white rounded-br-sm' : 'bg-white border border-gray-100 text-gray-900 rounded-bl-sm',
                !hasMedia && 'px-4 py-2.5'
              )}>
                {/* Media */}
                {hasMedia && (
                  <div className="relative">
                    {isVid ? (
                      <video
                        src={`http://localhost:4000${msg.media}`}
                        controls
                        className="w-full max-h-64 object-cover"
                      />
                    ) : (
                      <img
                        src={`http://localhost:4000${msg.media}`}
                        alt="media"
                        className="w-full max-h-64 object-cover cursor-pointer"
                        onClick={() => window.open(`http://localhost:4000${msg.media}`, '_blank')}
                      />
                    )}
                    {msg.contenu && !['📷 Photo', '🎥 Video'].includes(msg.contenu) && (
                      <p className="px-3 py-1 text-sm">{msg.contenu}</p>
                    )}
                  </div>
                )}

                {/* Texte */}
                {!hasMedia && <p className="text-sm">{msg.contenu}</p>}

                {/* Heure */}
                <p className={clsx(
                  'text-xs mt-1',
                  hasMedia ? 'px-3 pb-2' : '',
                  isMe ? 'text-violet-200' : 'text-gray-400'
                )}>
                  {new Date(msg.createdAt).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                  {isMe && <span className="ml-1">✓✓</span>}
                </p>
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      {/* Preview media */}
      {mediaPreview && (
        <div className="px-4 py-2 bg-gray-100 border-t border-gray-200 flex items-center gap-3">
          {isVideo(mediaPreview.file.name)
            ? <video src={mediaPreview.url} className="h-16 rounded-lg object-cover" />
            : <img src={mediaPreview.url} alt="" className="h-16 rounded-lg object-cover" />
          }
          <p className="text-xs text-gray-600 flex-1 truncate">{mediaPreview.file.name}</p>
          <button onClick={() => setMediaPreview(null)} className="text-red-500 hover:text-red-600 text-lg">✕</button>
        </div>
      )}

      {/* Zone de saisie style WhatsApp */}
      <div className="px-3 py-3 bg-gray-950 border-t border-gray-800 flex items-end gap-2 flex-shrink-0">

        {/* Bouton photo/video */}
        <button
          onClick={() => fileInputRef.current?.click()}
          className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-white transition-colors flex-shrink-0"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="w-5 h-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </button>
        <input ref={fileInputRef} type="file" accept="image/*,video/*" onChange={handleFileSelect} className="sr-only" />

        {/* Input message */}
        <div className="flex-1 bg-gray-800 rounded-2xl px-4 py-2.5 flex items-end gap-2">
          <textarea
            value={contenu}
            onChange={e => setContenu(e.target.value)}
            onKeyDown={handleKeyDown}
            rows={1}
            className="flex-1 bg-transparent outline-none text-sm text-white placeholder-gray-500 resize-none"
            placeholder="Entrez un message..."
            style={{ maxHeight: '100px', overflowY: 'auto' }}
          />
        </div>

        {/* Bouton envoyer */}
        <button
          onClick={handleEnvoyer}
          disabled={(!contenu.trim() && !mediaPreview) || sending}
          className="w-10 h-10 flex items-center justify-center rounded-full bg-violet-600 text-white hover:bg-violet-700 transition-all disabled:opacity-40 disabled:cursor-not-allowed active:scale-95 flex-shrink-0"
        >
          {sending ? (
            <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
          ) : (
            <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 rotate-90">
              <path d="M12 2L2 22l10-5 10 5L12 2z" />
            </svg>
          )}
        </button>
      </div>
    </div>
  );
}
