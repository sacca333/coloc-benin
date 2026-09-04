'use client';
import { useState, useRef, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useRequireAuth, useAuth } from '../../hooks/useAuth';
import { Navbar } from '../../components/layout/Navbar';
import api, { photoUrl, villesApi } from '../../lib/api';

const NIVEAUX = ['Licence 1', 'Licence 2', 'Licence 3', 'Master 1', 'Master 2', 'Doctorat', 'BTS', 'Autre'];

function EyeIcon({ open }: { open: boolean }) {
  return open ? (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.477 0 8.268 2.943 9.542 7-1.274 4.057-5.065 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
    </svg>
  ) : (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.477 0-8.268-2.943-9.542-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18" />
    </svg>
  );
}

function PasswordInput({ registration, placeholder }: { registration: any; placeholder?: string }) {
  const [visible, setVisible] = useState(false);
  return (
    <div className="relative">
      <input {...registration} type={visible ? 'text' : 'password'} className="input pr-10" placeholder={placeholder} />
      <button type="button" onClick={() => setVisible(!visible)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
        <EyeIcon open={visible} />
      </button>
    </div>
  );
}

export default function ProfilPage() {
  const { user, isLoading } = useRequireAuth();
  const { setUser } = useAuth();
  const [profilSuccess, setProfilSuccess] = useState('');
  const [profilError, setProfilError] = useState('');
  const [showProfilForm, setShowProfilForm] = useState(false);
  const [photoUploading, setPhotoUploading] = useState(false);
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [pwdSuccess, setPwdSuccess] = useState('');
  const [pwdError, setPwdError] = useState('');
  const [photoMenuOpen, setPhotoMenuOpen] = useState(false);
  const [photoModalOpen, setPhotoModalOpen] = useState(false);
  const [villes, setVilles] = useState<string[]>([]);

  useEffect(() => {
    villesApi.lister().then(r => setVilles(r.data)).catch(() => setVilles([]));
  }, []);
  const photoInputRef = useRef<HTMLInputElement>(null);

  const { register, handleSubmit, formState: { isSubmitting } } = useForm({
    values: user ? {
      nom: user.nom, prenom: user.prenom, telephone: user.telephone || '',
      ville: user.ville || '', universite: user.universite || '',
      filiere: user.filiere || '', niveau: user.niveau || '',
    } : undefined,
  });

  const { register: registerPwd, handleSubmit: handleSubmitPwd, reset: resetPwd, formState: { isSubmitting: isSubmittingPwd, errors: pwdErrors } } = useForm<{
    ancienMotDePasse: string; nouveauMotDePasse: string; confirmation: string;
  }>();

  const showProfilSuccess = (msg: string) => { setProfilError(''); setProfilSuccess(msg); setTimeout(() => setProfilSuccess(''), 4000); };
  const showProfilError = (msg: string) => { setProfilSuccess(''); setProfilError(msg); setTimeout(() => setProfilError(''), 4000); };
  const showPwdSuccess = (msg: string) => { setPwdError(''); setPwdSuccess(msg); setTimeout(() => setPwdSuccess(''), 4000); };
  const showPwdError = (msg: string) => { setPwdSuccess(''); setPwdError(msg); setTimeout(() => setPwdError(''), 4000); };

  const onSubmit = async (data: any) => {
    try {
      const { data: updated } = await api.put('/users/me', data);
      setUser(updated);
      showProfilSuccess('Profil mis a jour avec succes !');
    } catch { showProfilError('Erreur lors de la mise a jour du profil.'); }
  };

  const onSubmitPassword = async (data: any) => {
    if (data.nouveauMotDePasse !== data.confirmation) { showPwdError('Les mots de passe ne correspondent pas.'); return; }
    if (data.nouveauMotDePasse.length < 8) { showPwdError('Le nouveau mot de passe doit contenir au moins 8 caracteres.'); return; }
    try {
      await api.put('/users/me/password', { ancienMotDePasse: data.ancienMotDePasse, nouveauMotDePasse: data.nouveauMotDePasse });
      showPwdSuccess('Mot de passe modifie avec succes !');
      resetPwd();
      setShowPasswordForm(false);
    } catch (err: any) { showPwdError(err.response?.data?.error || 'Ancien mot de passe incorrect.'); }
  };

  const handlePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPhotoUploading(true);
    const fd = new FormData();
    fd.append('photo', file);
    try {
      const { data } = await api.post('/users/me/photo', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      setUser({ ...user!, photo: data.photo });
      showProfilSuccess('Photo mise a jour !');
    } catch { showProfilError('Erreur lors de l upload de la photo.'); }
    finally { setPhotoUploading(false); }
  };

  if (isLoading || !user) return <div className="min-h-screen flex items-center justify-center text-gray-400">Chargement...</div>;

  const userPhotoUrl = photoUrl(user.photo);

  return (
    <>
      <Navbar />
      <main className="max-w-xl mx-auto px-4 py-8">
        <h1 className="text-xl font-semibold mb-6">Mon profil</h1>

        {/* Photo + infos */}
        <div className="card mb-5 flex items-center gap-4">
          <div className="relative">
            {/* Photo cliquable */}
            <button onClick={() => setPhotoMenuOpen(!photoMenuOpen)} className="relative group focus:outline-none">
              {userPhotoUrl
                ? <img src={userPhotoUrl} alt="" className="w-16 h-16 rounded-full object-cover" />
                : <span className="w-16 h-16 rounded-full bg-primary-100 text-primary-600 flex items-center justify-center text-xl font-medium">{user.prenom[0]}{user.nom[0]}</span>
              }
              <div className="absolute inset-0 rounded-full bg-black/30 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                <span className="text-white text-xs">📷</span>
              </div>
            </button>

            {/* Menu options photo */}
            {photoMenuOpen && (
              <div className="absolute left-0 top-20 w-56 bg-white rounded-2xl shadow-xl border border-gray-100 py-2 z-50">
                {userPhotoUrl && (
                  <button onClick={() => { setPhotoModalOpen(true); setPhotoMenuOpen(false); }} className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                    🖼️ Voir la photo de profil
                  </button>
                )}
                <button onClick={() => { photoInputRef.current?.click(); setPhotoMenuOpen(false); }} className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                  📷 {userPhotoUrl ? 'Changer la photo' : 'Ajouter une photo'}
                </button>
                <button onClick={() => setPhotoMenuOpen(false)} className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-400 hover:bg-gray-50 transition-colors">
                  ✕ Fermer
                </button>
              </div>
            )}

            <input ref={photoInputRef} type="file" accept="image/*" onChange={handlePhotoChange} className="sr-only" />
          </div>

          <div>
            <p className="font-medium">{user.prenom} {user.nom}</p>
            <p className="text-sm text-gray-500">{user.email}</p>
            {photoUploading && <p className="text-xs text-primary-400 mt-0.5">Upload en cours...</p>}
          </div>
        </div>

        {/* Modal voir photo */}
        {photoModalOpen && userPhotoUrl && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60" onClick={() => setPhotoModalOpen(false)}>
            <div className="relative" onClick={e => e.stopPropagation()}>
              <img src={userPhotoUrl} alt="Photo de profil" className="w-72 h-72 rounded-full object-cover border-4 border-white shadow-2xl" />
              <button onClick={() => setPhotoModalOpen(false)} className="absolute -top-3 -right-3 w-8 h-8 bg-white rounded-full shadow flex items-center justify-center text-gray-600 hover:bg-gray-50 text-sm font-bold">
                ✕
              </button>
            </div>
          </div>
        )}

        {profilSuccess && <div className="mb-4 p-3 bg-teal-50 text-teal-700 text-sm rounded-lg border border-teal-100 flex items-center gap-2">✅ {profilSuccess}</div>}
        {profilError && <div className="mb-4 p-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-100 flex items-center gap-2">❌ {profilError}</div>}

        <div className="card mb-4">
          <div className="flex items-center justify-between mb-2">
            <div><h2 className="text-sm font-semibold text-gray-900">Informations personnelles</h2><p className="text-xs text-gray-500 mt-0.5">Modifiez votre profil et vos informations</p></div>
            <button onClick={() => { setShowProfilForm(!showProfilForm); setProfilError(''); setProfilSuccess(''); }} className="text-sm text-primary-600 hover:underline font-medium">{showProfilForm ? 'Annuler' : 'Modifier'}</button>
          </div>
          {showProfilForm && (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-3 border-t border-gray-100 mt-2">
              <div className="grid grid-cols-2 gap-3">
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Prenom</label><input {...register('prenom')} className="input" /></div>
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Nom</label><input {...register('nom')} className="input" /></div>
              </div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Telephone</label><input {...register('telephone')} className="input" placeholder="+229 97000000" /></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Ville</label><select {...register('ville')} className="input"><option value="">Choisir...</option>{villes.map(v => <option key={v} value={v}>{v}</option>)}</select></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Universite / Ecole</label><input {...register('universite')} className="input" placeholder="UAC, EPAC, HECM..." /></div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Filiere</label><input {...register('filiere')} className="input" placeholder="Informatique, Droit..." /></div>
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Niveau</label><select {...register('niveau')} className="input"><option value="">Choisir...</option>{NIVEAUX.map(n => <option key={n} value={n}>{n}</option>)}</select></div>
              </div>
              <button type="submit" disabled={isSubmitting} className="btn-primary w-full">{isSubmitting ? 'Enregistrement...' : 'Enregistrer les modifications'}</button>
            </form>
          )}
        </div>

        <div className="card">
          <div className="flex items-center justify-between mb-2">
            <div><h2 className="text-sm font-semibold text-gray-900">Mot de passe</h2><p className="text-xs text-gray-500 mt-0.5">Modifiez votre mot de passe de connexion</p></div>
            <button onClick={() => { setShowPasswordForm(!showPasswordForm); resetPwd(); setPwdError(''); setPwdSuccess(''); }} className="text-sm text-primary-600 hover:underline font-medium">{showPasswordForm ? 'Annuler' : 'Modifier'}</button>
          </div>
          {showPasswordForm && (
            <form onSubmit={handleSubmitPwd(onSubmitPassword)} className="space-y-3 pt-3 border-t border-gray-100 mt-2">
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Ancien mot de passe</label><PasswordInput registration={registerPwd('ancienMotDePasse', { required: true })} />{pwdErrors.ancienMotDePasse && <p className="text-xs text-red-500 mt-1">Champ requis</p>}</div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Nouveau mot de passe</label><PasswordInput registration={registerPwd('nouveauMotDePasse', { required: true, minLength: 8 })} placeholder="Min. 8 caracteres" />{pwdErrors.nouveauMotDePasse && <p className="text-xs text-red-500 mt-1">Minimum 8 caracteres</p>}</div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Confirmer le nouveau mot de passe</label><PasswordInput registration={registerPwd('confirmation', { required: true })} />{pwdErrors.confirmation && <p className="text-xs text-red-500 mt-1">Champ requis</p>}</div>
              {pwdError && <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-100 flex items-center gap-2">❌ {pwdError}</div>}
              {pwdSuccess && <div className="p-3 bg-teal-50 text-teal-700 text-sm rounded-lg border border-teal-100 flex items-center gap-2">✅ {pwdSuccess}</div>}
              <button type="submit" disabled={isSubmittingPwd} className="btn-primary w-full">{isSubmittingPwd ? 'Modification...' : 'Modifier le mot de passe'}</button>
            </form>
          )}
        </div>
      </main>
    </>
  );
}