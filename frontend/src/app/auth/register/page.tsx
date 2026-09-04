'use client';
import { useState, useRef, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { authApi, villesApi } from '../../../lib/api';

const schema = z.object({
  nom: z.string().min(2, 'Nom requis'),
  prenom: z.string().min(2, 'Prenom requis'),
  email: z.string().email('Email invalide'),
  motDePasse: z.string().min(8, 'Minimum 8 caracteres'),
  sexe: z.enum(['HOMME', 'FEMME'], { errorMap: () => ({ message: 'Sexe requis' }) }),
  typeCompte: z.enum(['ETUDIANT', 'AUTRE']).default('ETUDIANT'),
  profession: z.string().optional(),
  telephone: z.string().optional(),
  ville: z.string().optional(),
  universite: z.string().optional(),
  filiere: z.string().optional(),
  niveau: z.enum(['Licence 1', 'Licence 2', 'Licence 3', 'Master 1', 'Master 2', 'Doctorat', 'BTS', 'Autre']).optional().or(z.literal('')).transform(v => v === '' ? undefined : v),
}).refine(data => {
  if (data.typeCompte === 'AUTRE' && !data.profession?.trim()) return false;
  return true;
}, { message: 'Profession requise', path: ['profession'] });

type FormData = z.infer<typeof schema>;
const NIVEAUX = ['Licence 1', 'Licence 2', 'Licence 3', 'Master 1', 'Master 2', 'Doctorat', 'BTS', 'Autre'];

function VilleAutocomplete({ value, onChange, villes }: { value: string; onChange: (v: string) => void; villes: string[] }) {
  const [input, setInput] = useState(value || '');
  const [open, setOpen] = useState(false);
  const [highlight, setHighlight] = useState(0);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => { setInput(value || ''); }, [value]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const suggestions = input.trim()
    ? villes.filter(v => v.toLowerCase().includes(input.trim().toLowerCase()))
    : villes;

  const choisir = (ville: string) => {
    setInput(ville);
    onChange(ville);
    setOpen(false);
  };

  return (
    <div className="relative" ref={wrapperRef}>
      <input
        value={input}
        onChange={e => { setInput(e.target.value); onChange(e.target.value); setOpen(true); setHighlight(0); }}
        onFocus={() => setOpen(true)}
        onKeyDown={e => {
          if (!open || suggestions.length === 0) return;
          if (e.key === 'ArrowDown') { e.preventDefault(); setHighlight(h => Math.min(h + 1, suggestions.length - 1)); }
          else if (e.key === 'ArrowUp') { e.preventDefault(); setHighlight(h => Math.max(h - 1, 0)); }
          else if (e.key === 'Enter') { e.preventDefault(); choisir(suggestions[highlight]); }
          else if (e.key === 'Escape') setOpen(false);
        }}
        className="input"
        placeholder="Cotonou"
        autoComplete="off"
      />
      {open && suggestions.length > 0 && (
        <ul className="absolute z-20 left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-48 overflow-y-auto">
          {suggestions.map((v, i) => (
            <li
              key={v}
              onMouseDown={() => choisir(v)}
              onMouseEnter={() => setHighlight(i)}
              className={`px-3 py-2 text-sm cursor-pointer ${i === highlight ? 'bg-blue-50 text-blue-700' : 'text-gray-700'}`}
            >
              {v}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default function RegisterPage() {
  const router = useRouter();
  const [success, setSuccess] = useState(false);
  const [serverError, setServerError] = useState('');
  const [typeCompte, setTypeCompte] = useState<'ETUDIANT' | 'AUTRE'>('ETUDIANT');
  const [villes, setVilles] = useState<string[]>([]);

  useEffect(() => {
    villesApi.lister().then(r => setVilles(r.data)).catch(() => setVilles([]));
  }, []);

  const { register, handleSubmit, setValue, watch, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { typeCompte: 'ETUDIANT' },
  });


  const onSubmit = async (data: FormData) => {

    setServerError('');
    try {
      await authApi.register(data);
      setSuccess(true);
    } catch (err: any) {
      setServerError(err.response?.data?.error || "Erreur lors de l'inscription");
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <nav className="bg-sky-800 h-14 flex items-center px-6">
          <Link href="/" className="flex items-center gap-2">
            <img src="/logo.png" alt="logo" className="w-10 h-12 rounded-xl object-cover" />
            <span className="font-bold text-lg"><span className="text-green-400">Coloc</span><span className="text-yellow-400">Bénin</span></span>
          </Link>
        </nav>
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="card max-w-md w-full text-center">
            <div className="w-12 h-12 bg-teal-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-teal-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-lg font-semibold mb-2">Compte créé !</h2>
            <p className="text-sm text-gray-500 mb-4">Vérifiez votre boite mail et cliquez sur le lien de confirmation.</p>
            <Link href="/auth/login" className="block text-center text-sm w-full font-medium px-4 py-2 rounded-lg transition-colors bg-sky-800 hover:bg-sky-700 text-white">Se connecter</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <nav className="bg-sky-800 h-14 flex items-center px-6">
        <Link href="/" className="flex items-center gap-2">
          <img src="/logo.png" alt="logo" className="w-8 h-8 rounded-xl object-cover" />
          <span className="font-bold text-lg"><span className="text-green-400">Coloc</span><span className="text-yellow-400">Bénin</span></span>
        </Link>
      </nav>

      <div className="flex-1 flex items-center justify-center p-4 py-8">
        <div className="card max-w-lg w-full">
          <div className="mb-6 text-center">
            <img src="/logo.png" alt="logo" className="w-12 h-12 rounded-xl object-cover mx-auto mb-3" />
            <span className="text-2xl font-bold">
              <span className="text-green-600">Coloc</span>
              <span className="text-yellow-500">Bénin</span>
            </span>
            <h1 className="text-xl font-semibold mt-2">Créer un compte</h1>
            <p className="text-sm text-gray-500 mt-1">Rejoignez ColocBénin et trouvez votre colocation</p>
          </div>

          {serverError && (
            <div className="mb-4 p-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-100">{serverError}</div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 bg-white p-6 rounded-xl shadow">
            {/* Prénom / Nom */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Prénom</label>
                <input {...register('prenom')} className="input" placeholder="Koffi" />
                {errors.prenom && <p className="text-xs text-red-500 mt-1">{errors.prenom.message}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nom</label>
                <input {...register('nom')} className="input" placeholder="Agossou" />
                {errors.nom && <p className="text-xs text-red-500 mt-1">{errors.nom.message}</p>}
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input {...register('email')} type="email" className="input" placeholder="koffi@etudiant.bj" />
              {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email.message}</p>}
            </div>

            {/* Mot de passe */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Mot de passe</label>
              <input {...register('motDePasse')} type="password" className="input" placeholder="Min. 8 caracteres" />
              {errors.motDePasse && <p className="text-xs text-red-500 mt-1">{errors.motDePasse.message}</p>}
            </div>

            {/* Téléphone */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Téléphone (optionnel)</label>
              <input {...register('telephone')} className="input" placeholder="+229 97000000" />
            </div>

            {/* Sexe */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Sexe</label>
              <select {...register('sexe')} className="input">
                <option value="">Choisir...</option>
                <option value="HOMME">Homme</option>
                <option value="FEMME">Femme</option>
              </select>
              {errors.sexe && <p className="text-xs text-red-500 mt-1">{errors.sexe.message}</p>}
            </div>

            {/* Type de compte */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Profession</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => { setTypeCompte('ETUDIANT'); setValue('typeCompte', 'ETUDIANT'); }}
                  className={`py-2.5 px-4 rounded-lg border text-sm font-medium transition-colors ${typeCompte === 'ETUDIANT'
                    ? 'bg-blue-500 text-white border-blue-500'
                    : 'bg-white text-gray-600 border-gray-200 hover:border-blue-300'
                    }`}
                >
                  🎓 Étudiant
                </button>
                <button
                  type="button"
                  onClick={() => { setTypeCompte('AUTRE'); setValue('typeCompte', 'AUTRE'); }}
                  className={`py-2.5 px-4 rounded-lg border text-sm font-medium transition-colors ${typeCompte === 'AUTRE'
                    ? 'bg-blue-500 text-white border-blue-500'
                    : 'bg-white text-gray-600 border-gray-200 hover:border-blue-300'
                    }`}
                >
                  💼 Autre
                </button>
              </div>
            </div>

            {/* Champs Étudiant */}
            {typeCompte === 'ETUDIANT' && (
              <>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Ville</label>
                    <VilleAutocomplete value={watch('ville') || ''} onChange={v => setValue('ville', v)} villes={villes} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Niveau</label>
                    <select {...register('niveau')} className="input">
                      <option value="">Choisir...</option>
                      {NIVEAUX.map(n => <option key={n} value={n}>{n}</option>)}
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Université / École</label>
                  <input {...register('universite')} className="input" placeholder="UAC, EPAC, HECM..." />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Filière (optionnel)</label>
                  <input {...register('filiere')} className="input" placeholder="Informatique, Droit..." />
                </div>
              </>
            )}

            {/* Champs Autre */}
            {typeCompte === 'AUTRE' && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Ville</label>
                  <VilleAutocomplete value={watch('ville') || ''} onChange={v => setValue('ville', v)} villes={villes} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Profession</label>
                  <input {...register('profession')} className="input" placeholder="Médecin, Ingénieur, Commerçant..." />
                  {errors.profession && <p className="text-xs text-red-500 mt-1">{errors.profession.message}</p>}
                </div>
              </>
            )}

            <button type="submit" disabled={isSubmitting} className="btn-primary bg-blue-500 hover:bg-blue-600 text-white w-full mt-2">
              {isSubmitting ? 'Création en cours...' : 'Créer mon compte'}
            </button>
            <p className="text-center text-sm text-gray-500">
              Déjà un compte ?{' '}
              <Link href="/auth/login" className="text-blue-600 hover:underline font-medium">Se connecter</Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}