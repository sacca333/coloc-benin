'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { annoncesApi, messagerieApi } from '../../../lib/api';
import { Annonce } from '../../../types';
import { Navbar } from '../../../components/layout/Navbar';
import { useAuth } from '../../../hooks/useAuth';

export default function AnnonceDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { user, abonnementActif } = useAuth();
  const router = useRouter();
  const [annonce, setAnnonce] = useState<Annonce | null>(null);
  const [loading, setLoading] = useState(true);
  const [photoIdx, setPhotoIdx] = useState(0);
  const [messageEnvoi, setMessageEnvoi] = useState('');
  const [messageSent, setMessageSent] = useState(false);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    annoncesApi.getById(id).then(r => setAnnonce(r.data)).finally(() => setLoading(false));
  }, [id]);

  const handleContacter = async () => {
    if (!annonce || !messageEnvoi.trim()) return;
    try {
      await messagerieApi.envoyer(annonce.proprietaire.id, messageEnvoi);
      setMessageSent(true);
      router.push(`/messagerie/${annonce.proprietaire.id}`);
    } catch { }
  };

  const handleSupprimer = async () => {
    if (!annonce) return;
    setDeleting(true);
    try {
      await annoncesApi.supprimer(annonce.id);
      router.push('/mes-annonces');
    } catch {
      setDeleting(false);
      setShowConfirmDelete(false);
    }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center text-gray-400">Chargement...</div>
  );
  if (!annonce) return (
    <div className="min-h-screen flex items-center justify-center text-red-400">Annonce introuvable</div>
  );

  const isOwner = user?.id === annonce.proprietaire.id;

  return (
    <>
      <Navbar />
      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="grid md:grid-cols-3 gap-6">
          {/* Colonne principale */}
          <div className="md:col-span-2 space-y-5">
            {/* Galerie photos */}
            <div className="rounded-xl overflow-hidden bg-gray-100 aspect-video relative">
              {annonce.photos.length > 0 ? (
                <>
                  <img
                    src={annonce.photos[photoIdx]}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                  {annonce.photos.length > 1 && (
                    <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-1.5">
                      {annonce.photos.map((_, i) => (
                        <button
                          key={i}
                          onClick={() => setPhotoIdx(i)}
                          className={`w-2 h-2 rounded-full transition-all ${i === photoIdx ? 'bg-white' : 'bg-white/50'}`}
                        />
                      ))}
                    </div>
                  )}
                </>
              ) : (
                <div className="w-full h-full flex items-center justify-center text-5xl">🏠</div>
              )}
            </div>

            {/* Infos principales */}
            <div className="card">
              <div className="flex items-start justify-between flex-wrap gap-3">
                <div>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${annonce.type === 'LOGEMENT_DISPONIBLE' ? 'bg-sky-50 text-sky-800' : 'bg-teal-50 text-teal-600'}`}>
                    {annonce.type === 'LOGEMENT_DISPONIBLE' ? 'Logement disponible' : 'Place en colocation'}
                  </span>
                  <h1 className="text-lg font-semibold mt-2">
                    {annonce.quartier ? `${annonce.quartier}, ` : ''}{annonce.ville}
                  </h1>
                  {annonce.adresse && <p className="text-sm text-gray-500">{annonce.adresse}</p>}
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-gray-900">{annonce.loyerTotal.toLocaleString()} FCFA</p>
                  <p className="text-xs text-gray-400">/ mois · {annonce.nbPlaces} places</p>
                  {annonce.caution && <p className="text-xs text-gray-400 mt-0.5">Caution : {annonce.caution.toLocaleString()} FCFA</p>}
                </div>
              </div>
            </div>

            {/* Équipements */}
            {annonce.equipements.length > 0 && (
              <div className="card">
                <h2 className="font-medium text-sm mb-3">Équipements</h2>
                <div className="flex flex-wrap gap-2">
                  {annonce.equipements.map(eq => (
                    <span key={eq} className="px-3 py-1 bg-gray-50 border border-gray-100 rounded-full text-sm text-gray-700">{eq}</span>
                  ))}
                </div>
              </div>
            )}

            {/* Description */}
            {annonce.description && (
              <div className="card">
                <h2 className="font-medium text-sm mb-2">Description</h2>
                <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-line">{annonce.description}</p>
              </div>
            )}
          </div>

          {/* Colonne latérale */}
          <div className="space-y-4">
            {/* Propriétaire */}
            <div className="card">
              <h2 className="font-medium text-sm mb-3">Publié par</h2>
              <div className="flex items-center gap-3 mb-4">
                {annonce.proprietaire.photo
                  ? <img src={annonce.proprietaire.photo} alt="" className="w-10 h-10 rounded-full object-cover" />
                  : <span className="w-10 h-10 rounded-full bg-primary-100 text-primary-600 flex items-center justify-center text-sm font-medium">
                    {annonce.proprietaire.prenom[0]}{annonce.proprietaire.nom[0]}
                  </span>
                }
                <div>
                  <p className="font-medium text-sm">{annonce.proprietaire.prenom} {annonce.proprietaire.nom}</p>
                  <p className="text-xs text-gray-400">Membre ColocBénin</p>
                </div>
              </div>

              {!isOwner && (
                user ? (
                  abonnementActif ? (
                    <div>
                      <textarea
                        rows={3}
                        value={messageEnvoi}
                        onChange={e => setMessageEnvoi(e.target.value)}
                        className="input resize-none text-sm w-full mb-2"
                        placeholder="Bonjour, je suis intéressé(e) par votre annonce..."
                      />
                      <button
                        onClick={handleContacter}
                        disabled={!messageEnvoi.trim()}
                        className="bg-sky-800 hover:bg-sky-700 disabled:opacity-50 text-white text-sm font-medium px-4 py-2 rounded-xl transition-colors w-full"
                      >
                        Envoyer un message
                      </button>
                    </div>
                  ) : (
                    <Link href="/abonnement" className="bg-sky-800 hover:bg-sky-700 text-white text-sm font-medium px-4 py-2 rounded-xl transition-colors block text-center">
                      S'abonner pour contacter
                    </Link>
                  )
                ) : (
                  <Link href="/auth/login" className="bg-sky-800 hover:bg-sky-700 text-white text-sm font-medium px-4 py-2 rounded-xl transition-colors block text-center">
                    Se connecter pour contacter
                  </Link>
                )
              )}

              {isOwner && (
                <div className="space-y-2">
                  <Link
                    href={`/annonces/${annonce.id}/modifier`}
                    className="bg-sky-800 hover:bg-sky-700 text-white text-sm font-medium px-4 py-2 rounded-xl transition-colors block text-center"
                  >
                    ✏️ Modifier mon annonce
                  </Link>
                  <button
                    onClick={() => setShowConfirmDelete(true)}
                    className="w-full py-2 px-4 rounded-lg border border-red-200 text-red-600 text-sm font-medium hover:bg-red-50 transition-colors"
                  >
                    🗑️ Supprimer l'annonce
                  </button>
                </div>
              )}
            </div>

            {/* Date */}
            <div className="text-xs text-gray-400 text-center">
              Publiée le {new Date(annonce.createdAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
            </div>
          </div>
        </div>
      </main>

      {/* Modal confirmation suppression */}
      {showConfirmDelete && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-xl">
            <h3 className="text-base font-semibold text-gray-900 mb-2">Supprimer l'annonce ?</h3>
            <p className="text-sm text-gray-500 mb-5">
              Cette action est irréversible. L'annonce ne sera plus visible par les autres utilisateurs.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowConfirmDelete(false)}
                disabled={deleting}
                className="btn-outline flex-1 text-sm"
              >
                Annuler
              </button>
              <button
                onClick={handleSupprimer}
                disabled={deleting}
                className="flex-1 py-2 px-4 rounded-lg bg-red-500 hover:bg-red-600 text-white text-sm font-medium transition-colors disabled:opacity-50"
              >
                {deleting ? 'Suppression...' : 'Oui, supprimer'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}