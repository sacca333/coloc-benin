'use client';
import { useEffect, useState, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { messagerieApi, photoUrl, demandesColApi, blocagesApi } from '../../../lib/api';
import { Message, DemandeColocation } from '../../../types';
import { useAuth } from '../../../hooks/useAuth';
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
  const [interlocuteurInfo, setInterlocuteurInfo] = useState<{ id: string; nom: string; prenom: string; photo?: string } | null>(null);
  const [demandeEnCours, setDemandeEnCours] = useState<DemandeColocation | null>(null);
  const [blocageInfo, setBlocageInfo] = useState<{ jaiBloque: boolean; mEstBloque: boolean }>({ jaiBloque: false, mEstBloque: false });
  const [modalColoc, setModalColoc] = useState(false);
  const [modalBlocage, setModalBlocage] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const optionsRef = useRef<HTMLDivElement>(null);

  const showToast = (type: 'success' | 'error', msg: string) => {
    setToast({ type, msg });
    setTimeout(() => setToast(null), 4000);
  };

  const charger = async () => {
    try {
      const r = await messagerieApi.messages(userId);
      setMessages(r.data);
      setLoading(false);
      const autre = r.data.find((m: any) => m?.expediteur?.id !== user?.id);
      if (autre?.expediteur) setInterlocuteurInfo(autre.expediteur);
      else {
        try {
          const res = await api.get(`/users/${userId}`);
          setInterlocuteurInfo(res.data);
        } catch { }
      }
    } catch { setLoading(false); }
  };

  const chargerDemande = async () => {
    try {
      const [recues, envoyees] = await Promise.all([
        demandesColApi.recues(),
        demandesColApi.envoyees(),
      ]);
      const demande =
        recues.data.find((d: DemandeColocation) => d.expediteurId === userId) ||
        envoyees.data.find((d: DemandeColocation) => d.destinataireId === userId);
      setDemandeEnCours(demande || null);
    } catch { }
  };

  const chargerBlocage = async () => {
    try {
      const { data } = await blocagesApi.verifie(userId);
      setBlocageInfo(data);
    } catch { }
  };

  useEffect(() => {
    charger();
    chargerDemande();
    chargerBlocage();
    const interval = setInterval(charger, 10000);
    return () => clearInterval(interval);
  }, [userId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (optionsRef.current && !optionsRef.current.contains(e.target as Node)) setOptionsOpen(false);
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleEnvoyer = async () => {
    if (sending || blocageInfo.jaiBloque || blocageInfo.mEstBloque) return;
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
    } finally { setSending(false); }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleEnvoyer(); }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setMediaPreview({ file, url: URL.createObjectURL(file) });
  };

  const handleEnvoyerDemande = async () => {
    setActionLoading(true);
    try {
      await demandesColApi.envoyer(userId);
      showToast('success', 'Demande de colocation envoyee !');
      setModalColoc(false);
      chargerDemande();
    } catch (err: any) {
      showToast('error', err.response?.data?.error || 'Erreur lors de l envoi');
    } finally { setActionLoading(false); }
  };

  const handleAccepterDemande = async (id: string) => {
    setActionLoading(true);
    try {
      await demandesColApi.accepter(id);
      showToast('success', 'Colocation creee avec succes !');
      chargerDemande();
      setTimeout(() => router.push('/colocations'), 2000);
    } catch (err: any) {
      showToast('error', err.response?.data?.error || 'Erreur');
    } finally { setActionLoading(false); }
  };

  const handleRejeterDemande = async (id: string) => {
    setActionLoading(true);
    try {
      await demandesColApi.rejeter(id);
      showToast('success', 'Demande rejetee');
      chargerDemande();
    } catch (err: any) {
      showToast('error', err.response?.data?.error || 'Erreur');
    } finally { setActionLoading(false); }
  };

  const handleBloquer = async () => {
    setActionLoading(true);
    try {
      await blocagesApi.bloquer(userId);
      showToast('success', `${interlocuteurInfo?.prenom} a ete bloque`);
      setModalBlocage(false);
      chargerBlocage();
    } catch (err: any) {
      showToast('error', err.response?.data?.error || 'Erreur');
    } finally { setActionLoading(false); }
  };

  const handleDebloquer = async () => {
    setActionLoading(true);
    try {
      await blocagesApi.debloquer(userId);
      showToast('success', `${interlocuteurInfo?.prenom} a ete debloque`);
      chargerBlocage();
    } catch (err: any) {
      showToast('error', err.response?.data?.error || 'Erreur');
    } finally { setActionLoading(false); }
  };

  const isVideo = (url: string) => url?.includes('.mp4') || url?.includes('.mov');
  const interlocuteurPhoto = photoUrl(interlocuteurInfo?.photo);
  const demandeRecueDeMoi = demandeEnCours?.destinataireId === user?.id && demandeEnCours?.statut === 'EN_ATTENTE';
  const demandeEnvoyeeParMoi = demandeEnCours?.expediteurId === user?.id && demandeEnCours?.statut === 'EN_ATTENTE';

  if (loading) return <div className="min-h-screen flex items-center justify-center text-gray-400">Chargement...</div>;

  return (
    <div className="flex flex-col h-screen">

      {/* Toast */}
      {toast && (
        <div className={clsx('fixed top-4 right-4 z-50 px-4 py-3 rounded-xl shadow-lg text-sm font-medium',
          toast.type === 'success' ? 'bg-green-500 text-white' : 'bg-red-500 text-white')}>
          {toast.msg}
        </div>
      )}

      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 bg-sky-800 border-b border-sky-700 flex-shrink-0">
        <button onClick={() => router.back()} className="text-sky-200 hover:text-white mr-1">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-5 h-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        {interlocuteurPhoto
          ? <img src={interlocuteurPhoto} alt="" className="w-9 h-9 rounded-full object-cover flex-shrink-0 border-2 border-sky-600" />
          : <span className="w-9 h-9 rounded-full bg-sky-600 text-white flex items-center justify-center text-sm font-semibold flex-shrink-0">
            {interlocuteurInfo ? `${interlocuteurInfo.prenom[0]}${interlocuteurInfo.nom[0]}` : '?'}
          </span>
        }

        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-white truncate">
            {interlocuteurInfo ? `${interlocuteurInfo.prenom} ${interlocuteurInfo.nom}` : 'Chargement...'}
          </p>
          <p className="text-xs text-sky-300">En ligne</p>
        </div>


        {/* Bouton 3 points */}
        <div className="relative" ref={optionsRef}>
          <button onClick={() => setOptionsOpen(!optionsOpen)}
            className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-sky-700 transition-colors text-sky-200 hover:text-white">
            <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
              <circle cx="12" cy="5" r="1.5" /><circle cx="12" cy="12" r="1.5" /><circle cx="12" cy="19" r="1.5" />
            </svg>
          </button>

          {optionsOpen && (
            <div className="absolute right-0 top-11 w-56 bg-white border border-gray-100 rounded-2xl py-2 shadow-xl z-50">

              <button onClick={() => { setOptionsOpen(false); blocageInfo.jaiBloque ? handleDebloquer() : setModalBlocage(true); }}
                className="w-full flex items-center gap-3 px-4 py-3 text-sm text-red-500 hover:bg-red-50 text-left">
                <span>🚫</span>
                <p className="font-medium">{blocageInfo.jaiBloque ? `Debloquer ${interlocuteurInfo?.prenom}` : `Bloquer ${interlocuteurInfo?.prenom}`}</p>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Bandeau blocage */}
      {blocageInfo.jaiBloque && (
        <div className="bg-red-50 border-b border-red-100 px-4 py-2 flex items-center justify-between">
          <p className="text-xs text-red-600">Vous avez bloque {interlocuteurInfo?.prenom}</p>
          <button onClick={handleDebloquer} className="text-xs text-blue-600 hover:underline">Debloquer</button>
        </div>
      )}
      {blocageInfo.mEstBloque && (
        <div className="bg-red-50 border-b border-red-100 px-4 py-2">
          <p className="text-xs text-red-600 text-center">Vous ne pouvez plus envoyer de messages a cet utilisateur</p>
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-2 bg-gray-50">
        {messages.length === 0 && (
          <div className="text-center mt-12">
            <p className="text-4xl mb-2">👋</p>
            <p className="text-gray-400 text-sm">Demarrez la conversation</p>
          </div>
        )}

        {/* Carte demande colocation reçue */}
        {demandeRecueDeMoi && demandeEnCours && (
          <div className="mx-auto max-w-sm bg-white rounded-2xl border-2 border-sky-200 shadow-md p-4 my-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-2xl">🏠</span>
              <div>
                <p className="font-semibold text-gray-900 text-sm">{interlocuteurInfo?.prenom} vous propose une colocation</p>
                {demandeEnCours.message && <p className="text-xs text-gray-500 mt-0.5">"{demandeEnCours.message}"</p>}
              </div>
            </div>
            <div className="flex gap-2 mt-3">
              <button onClick={() => handleAccepterDemande(demandeEnCours.id)} disabled={actionLoading}
                className="flex-1 py-2 rounded-xl bg-green-500 text-white text-sm font-semibold hover:bg-green-600 transition-colors disabled:opacity-50">
                {actionLoading ? '...' : '✓ Accepter'}
              </button>
              <button onClick={() => handleRejeterDemande(demandeEnCours.id)} disabled={actionLoading}
                className="flex-1 py-2 rounded-xl border border-red-200 text-red-500 text-sm font-semibold hover:bg-red-50 transition-colors disabled:opacity-50">
                ✗ Rejeter
              </button>
            </div>
          </div>
        )}

        {messages.map(msg => {
          const isMe = msg?.expediteur?.id === user?.id;
          const hasMedia = msg?.media;
          const isVid = hasMedia && isVideo(msg.media!);

          return (
            <div key={msg.id} className={clsx('flex items-end gap-2', isMe ? 'justify-end' : 'justify-start')}>
              {!isMe && (
                interlocuteurPhoto
                  ? <img src={interlocuteurPhoto} alt="" className="w-6 h-6 rounded-full object-cover flex-shrink-0 mb-1" />
                  : <span className="w-6 h-6 rounded-full bg-sky-600 text-white flex items-center justify-center text-xs flex-shrink-0 mb-1">
                    {interlocuteurInfo?.prenom?.[0] || '?'}
                  </span>
              )}
              <div className={clsx(
                'max-w-xs md:max-w-sm rounded-2xl overflow-hidden',
                isMe ? 'bg-sky-700 text-white rounded-br-sm' : 'bg-white border border-gray-100 text-gray-900 rounded-bl-sm',
                !hasMedia && 'px-4 py-2.5'
              )}>
                {hasMedia && (
                  isVid
                    ? <video src={`http://localhost:4000${msg.media}`} controls className="w-full max-h-64 object-cover" />
                    : <img src={`http://localhost:4000${msg.media}`} alt="media" className="w-full max-h-64 object-cover cursor-pointer"
                      onClick={() => window.open(`http://localhost:4000${msg.media}`, '_blank')} />
                )}
                {!hasMedia && <p className="text-sm">{msg.contenu}</p>}
                <p className={clsx('text-xs mt-1', hasMedia ? 'px-3 pb-2' : '', isMe ? 'text-sky-200' : 'text-gray-400')}>
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
        <div className="px-4 py-2 bg-sky-50 border-t border-sky-200 flex items-center gap-3">
          {isVideo(mediaPreview.file.name)
            ? <video src={mediaPreview.url} className="h-16 rounded-lg object-cover" />
            : <img src={mediaPreview.url} alt="" className="h-16 rounded-lg object-cover" />
          }
          <p className="text-xs text-gray-600 flex-1 truncate">{mediaPreview.file.name}</p>
          <button onClick={() => setMediaPreview(null)} className="text-red-500 text-lg">✕</button>
        </div>
      )}

      {/* Zone de saisie */}
      <div className="px-3 py-3 bg-sky-800 border-t border-sky-700 flex items-end gap-2 flex-shrink-0">
        <button onClick={() => fileInputRef.current?.click()} disabled={blocageInfo.jaiBloque || blocageInfo.mEstBloque}
          className="w-10 h-10 flex items-center justify-center rounded-full bg-sky-700 text-sky-200 hover:bg-sky-600 hover:text-white transition-colors flex-shrink-0 disabled:opacity-40">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="w-5 h-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </button>
        <input ref={fileInputRef} type="file" accept="image/*,video/*" onChange={handleFileSelect} className="sr-only" />

        <div className="flex-1 bg-sky-700 rounded-2xl px-4 py-2.5">
          <textarea value={contenu} onChange={e => setContenu(e.target.value)} onKeyDown={handleKeyDown} rows={1}
            disabled={blocageInfo.jaiBloque || blocageInfo.mEstBloque}
            className="flex-1 w-full bg-transparent outline-none text-sm text-white placeholder-sky-300 resize-none disabled:opacity-40"
            placeholder={blocageInfo.mEstBloque ? 'Vous ne pouvez plus envoyer de messages' : blocageInfo.jaiBloque ? 'Vous avez bloque cet utilisateur' : 'Entrez un message...'}
            style={{ maxHeight: '100px', overflowY: 'auto' }}
          />
        </div>

        <button onClick={handleEnvoyer} disabled={(!contenu.trim() && !mediaPreview) || sending || blocageInfo.jaiBloque || blocageInfo.mEstBloque}
          className="w-10 h-10 flex items-center justify-center rounded-full bg-blue-600 text-white hover:bg-blue-700 transition-all disabled:opacity-40 active:scale-95 flex-shrink-0">
          {sending
            ? <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
            : <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 rotate-90"><path d="M12 2L2 22l10-5 10 5L12 2z" /></svg>
          }
        </button>
      </div>

      {/* Modal colocation */}
      {modalColoc && (
        <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-black/50" onClick={() => setModalColoc(false)}>
          <div className="bg-white w-full md:max-w-sm rounded-t-3xl md:rounded-2xl p-6 shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="w-10 h-1 bg-gray-200 rounded-full mx-auto mb-5 md:hidden" />
            <h2 className="text-lg font-semibold mb-1">Proposer une colocation</h2>
            <p className="text-sm text-gray-500 mb-5">
              Voulez-vous envoyer une demande de colocation a <strong>{interlocuteurInfo?.prenom}</strong> ?
            </p>
            <div className="flex gap-3">
              <button onClick={() => setModalColoc(false)} className="flex-1 py-3 rounded-xl border border-gray-200 text-sm font-medium text-gray-600">Annuler</button>
              <button onClick={handleEnvoyerDemande} disabled={actionLoading}
                className="flex-1 py-3 rounded-xl bg-sky-700 text-white text-sm font-semibold hover:bg-sky-800 transition-colors disabled:opacity-50">
                {actionLoading ? 'Envoi...' : '🏠 Envoyer la demande'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal blocage */}
      {modalBlocage && (
        <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-black/50" onClick={() => setModalBlocage(false)}>
          <div className="bg-white w-full md:max-w-sm rounded-t-3xl md:rounded-2xl p-6 shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="w-10 h-1 bg-gray-200 rounded-full mx-auto mb-5 md:hidden" />
            <h2 className="text-lg font-semibold mb-1 text-red-600">Bloquer {interlocuteurInfo?.prenom} ?</h2>
            <p className="text-sm text-gray-500 mb-5">Vous ne pourrez plus echanger de messages avec cet utilisateur.</p>
            <div className="flex gap-3">
              <button onClick={() => setModalBlocage(false)} className="flex-1 py-3 rounded-xl border border-gray-200 text-sm font-medium text-gray-600">Annuler</button>
              <button onClick={handleBloquer} disabled={actionLoading}
                className="flex-1 py-3 rounded-xl bg-red-500 text-white text-sm font-semibold hover:bg-red-600 transition-colors disabled:opacity-50">
                {actionLoading ? 'Blocage...' : '🚫 Bloquer'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
