'use client';
import { useEffect, useRef, useState } from 'react';
import { api, photoUrl } from '@/lib/api';

interface AdminUser {
    id: string;
    nom: string;
    prenom: string;
    email: string;
    telephone?: string | null;
    photo?: string | null;
}

export default function AdminProfil() {
    const [user, setUser] = useState<AdminUser | null>(null);
    const [loading, setLoading] = useState(true);
    const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);

    const [showInfoForm, setShowInfoForm] = useState(false);
    const [nom, setNom] = useState('');
    const [prenom, setPrenom] = useState('');
    const [telephone, setTelephone] = useState('');
    const [savingInfo, setSavingInfo] = useState(false);

    const [showPwdForm, setShowPwdForm] = useState(false);
    const [ancienMdp, setAncienMdp] = useState('');
    const [nouveauMdp, setNouveauMdp] = useState('');
    const [confirmMdp, setConfirmMdp] = useState('');
    const [savingPwd, setSavingPwd] = useState(false);

    const [photoMenuOpen, setPhotoMenuOpen] = useState(false);
    const [photoModalOpen, setPhotoModalOpen] = useState(false);
    const [photoUploading, setPhotoUploading] = useState(false);
    const photoInputRef = useRef<HTMLInputElement>(null);

    const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
        setToast({ msg, type });
        setTimeout(() => setToast(null), 3500);
    };

    useEffect(() => {
        load();
    }, []);

    const load = async () => {
        setLoading(true);
        try {
            const r = await api.get('/auth/me');
            setUser(r.data);
            setNom(r.data.nom || '');
            setPrenom(r.data.prenom || '');
            setTelephone(r.data.telephone || '');
        } catch {
            showToast('Impossible de charger le profil', 'error');
        } finally {
            setLoading(false);
        }
    };

    const enregistrerInfos = async () => {
        if (!nom.trim() || !prenom.trim()) {
            showToast('Nom et prénom sont requis', 'error');
            return;
        }
        setSavingInfo(true);
        try {
            const r = await api.put('/users/me', { nom: nom.trim(), prenom: prenom.trim(), telephone: telephone.trim() });
            setUser(prev => prev ? { ...prev, ...r.data } : r.data);
            setShowInfoForm(false);
            showToast('Profil mis à jour avec succès');
        } catch (err: any) {
            showToast(err?.response?.data?.error || 'Échec de la mise à jour', 'error');
        } finally {
            setSavingInfo(false);
        }
    };

    const changerMotDePasse = async () => {
        if (!ancienMdp || !nouveauMdp || !confirmMdp) {
            showToast('Tous les champs sont requis', 'error');
            return;
        }
        if (nouveauMdp.length < 8) {
            showToast('Le nouveau mot de passe doit contenir au moins 8 caractères', 'error');
            return;
        }
        if (nouveauMdp !== confirmMdp) {
            showToast('Les mots de passe ne correspondent pas', 'error');
            return;
        }
        setSavingPwd(true);
        try {
            await api.put('/users/me/password', { ancienMotDePasse: ancienMdp, nouveauMotDePasse: nouveauMdp });
            setAncienMdp(''); setNouveauMdp(''); setConfirmMdp('');
            setShowPwdForm(false);
            showToast('Mot de passe modifié avec succès');
        } catch (err: any) {
            showToast(err?.response?.data?.error || 'Ancien mot de passe incorrect', 'error');
        } finally {
            setSavingPwd(false);
        }
    };

    const handlePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setPhotoUploading(true);
        const fd = new FormData();
        fd.append('photo', file);
        try {
            const r = await api.post('/users/me/photo', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
            setUser(prev => prev ? { ...prev, photo: r.data.photo } : prev);
            showToast('Photo mise à jour');
        } catch {
            showToast("Échec de l'upload de la photo", 'error');
        } finally {
            setPhotoUploading(false);
            if (photoInputRef.current) photoInputRef.current.value = '';
        }
    };

    const currentPhotoUrl = photoUrl(user?.photo);

    if (loading) {
        return (
            <div style={{ textAlign: 'center', padding: '60px 20px' }}>
                <div style={{ width: 32, height: 32, border: '3px solid #0284c7', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin .8s linear infinite', margin: '0 auto' }} />
                <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
            </div>
        );
    }

    if (!user) return null;

    return (
        <div style={{ fontFamily: "'Syne',sans-serif", maxWidth: 640 }}>
            <style>{`
        @keyframes drop { from { opacity:0; transform:translateY(-8px) } to { opacity:1; transform:translateY(0) } }
        .aprofil-card { background:#fff; border:1px solid #e0f2fe; border-radius:14px; padding:20px; margin-bottom:16px; }
        .aprofil-input { width:100%; background:#f0f9ff; border:1px solid #bae6fd; border-radius:10px; padding:9px 14px; color:#0c4a6e; font-size:13px; outline:none; font-family:"Syne",sans-serif; box-sizing:border-box; }
        .aprofil-label { display:block; font-size:12px; font-weight:600; color:#0c4a6e; margin-bottom:6px; }
        .aprofil-btn { padding:9px 18px; border-radius:10px; border:1px solid; cursor:pointer; font-size:13px; font-weight:600; font-family:"Syne",sans-serif; transition:all .2s; }
      `}</style>

            {toast && (
                <div style={{ position: 'fixed', bottom: 24, right: 24, zIndex: 9999, background: toast.type === 'success' ? '#065f46' : '#991b1b', color: '#fff', padding: '12px 20px', borderRadius: 12, fontSize: 13, fontWeight: 600, boxShadow: '0 4px 20px rgba(0,0,0,0.2)', animation: 'drop .3s ease' }}>
                    {toast.type === 'success' ? '✓' : '✕'} {toast.msg}
                </div>
            )}

            <div style={{ marginBottom: 28 }}>
                <div style={{ fontSize: 10, color: '#0284c7', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: 6 }}>Administration</div>
                <h1 style={{ fontSize: 28, fontWeight: 800, color: '#0c4a6e', margin: 0 }}>Mon profil</h1>
                <p style={{ color: '#64748b', fontSize: 13, marginTop: 4 }}>Gérer les informations de ton compte administrateur</p>
            </div>

            {/* Photo + identité */}
            <div className="aprofil-card" style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                <div style={{ position: 'relative' }}>
                    <button onClick={() => setPhotoMenuOpen(o => !o)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, position: 'relative' }}>
                        {currentPhotoUrl ? (
                            <img src={currentPhotoUrl} alt="" style={{ width: 64, height: 64, borderRadius: '50%', objectFit: 'cover' }} />
                        ) : (
                            <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'linear-gradient(135deg,#4ade80,#3b82f6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, fontWeight: 700, color: '#fff' }}>
                                {user.prenom?.[0]}{user.nom?.[0]}
                            </div>
                        )}
                    </button>

                    {photoMenuOpen && (
                        <div style={{ position: 'absolute', left: 0, top: 72, width: 220, background: '#fff', borderRadius: 14, boxShadow: '0 8px 24px rgba(0,0,0,0.15)', border: '1px solid #e0f2fe', padding: '6px 0', zIndex: 50 }}>
                            {currentPhotoUrl && (
                                <button onClick={() => { setPhotoModalOpen(true); setPhotoMenuOpen(false); }}
                                    style={{ width: '100%', textAlign: 'left', background: 'none', border: 'none', cursor: 'pointer', padding: '10px 16px', fontSize: 13, color: '#0c4a6e', fontFamily: "'Syne',sans-serif" }}>
                                    🖼️ Voir la photo
                                </button>
                            )}
                            <button onClick={() => { photoInputRef.current?.click(); setPhotoMenuOpen(false); }}
                                style={{ width: '100%', textAlign: 'left', background: 'none', border: 'none', cursor: 'pointer', padding: '10px 16px', fontSize: 13, color: '#0c4a6e', fontFamily: "'Syne',sans-serif" }}>
                                📷 {currentPhotoUrl ? 'Changer la photo' : 'Ajouter une photo'}
                            </button>
                            <button onClick={() => setPhotoMenuOpen(false)}
                                style={{ width: '100%', textAlign: 'left', background: 'none', border: 'none', cursor: 'pointer', padding: '10px 16px', fontSize: 13, color: '#94a3b8', fontFamily: "'Syne',sans-serif" }}>
                                ✕ Fermer
                            </button>
                        </div>
                    )}

                    <input ref={photoInputRef} type="file" accept="image/*" onChange={handlePhotoChange} style={{ display: 'none' }} />
                </div>

                <div>
                    <div style={{ fontSize: 16, fontWeight: 700, color: '#0c4a6e' }}>{user.prenom} {user.nom}</div>
                    <div style={{ fontSize: 13, color: '#64748b' }}>{user.email}</div>
                    {photoUploading && <div style={{ fontSize: 12, color: '#0284c7', marginTop: 4 }}>Envoi de la photo...</div>}
                </div>
            </div>

            {/* Modal photo */}
            {photoModalOpen && currentPhotoUrl && (
                <div onClick={() => setPhotoModalOpen(false)} style={{ position: 'fixed', inset: 0, zIndex: 9999, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <div onClick={e => e.stopPropagation()} style={{ position: 'relative' }}>
                        <img src={currentPhotoUrl} alt="Photo de profil" style={{ width: 280, height: 280, borderRadius: '50%', objectFit: 'cover', border: '4px solid #fff', boxShadow: '0 20px 60px rgba(0,0,0,0.4)' }} />
                        <button onClick={() => setPhotoModalOpen(false)}
                            style={{ position: 'absolute', top: -12, right: -12, width: 32, height: 32, borderRadius: '50%', background: '#fff', border: 'none', cursor: 'pointer', fontWeight: 700, color: '#0c4a6e' }}>
                            ✕
                        </button>
                    </div>
                </div>
            )}

            {/* Informations personnelles */}
            <div className="aprofil-card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: showInfoForm ? 14 : 0 }}>
                    <div>
                        <div style={{ fontSize: 14, fontWeight: 700, color: '#0c4a6e' }}>Informations personnelles</div>
                        <div style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>Nom, prénom et téléphone</div>
                    </div>
                    <button className="aprofil-btn" onClick={() => setShowInfoForm(s => !s)}
                        style={{ borderColor: '#0284c7', background: showInfoForm ? '#f0f9ff' : '#0284c7', color: showInfoForm ? '#0284c7' : '#fff' }}>
                        {showInfoForm ? 'Annuler' : 'Modifier'}
                    </button>
                </div>

                {showInfoForm && (
                    <div style={{ paddingTop: 14, borderTop: '1px solid #f0f9ff', display: 'flex', flexDirection: 'column', gap: 12 }}>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                            <div>
                                <label className="aprofil-label">Prénom</label>
                                <input className="aprofil-input" value={prenom} onChange={e => setPrenom(e.target.value)} />
                            </div>
                            <div>
                                <label className="aprofil-label">Nom</label>
                                <input className="aprofil-input" value={nom} onChange={e => setNom(e.target.value)} />
                            </div>
                        </div>
                        <div>
                            <label className="aprofil-label">Téléphone</label>
                            <input className="aprofil-input" value={telephone} onChange={e => setTelephone(e.target.value)} placeholder="+229 97000000" />
                        </div>
                        <button className="aprofil-btn" onClick={enregistrerInfos} disabled={savingInfo}
                            style={{ borderColor: '#16a34a', background: '#16a34a', color: '#fff', alignSelf: 'flex-start' }}>
                            {savingInfo ? 'Enregistrement...' : 'Enregistrer'}
                        </button>
                    </div>
                )}
            </div>

            {/* Mot de passe */}
            <div className="aprofil-card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: showPwdForm ? 14 : 0 }}>
                    <div>
                        <div style={{ fontSize: 14, fontWeight: 700, color: '#0c4a6e' }}>Mot de passe</div>
                        <div style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>Modifier le mot de passe de connexion</div>
                    </div>
                    <button className="aprofil-btn" onClick={() => setShowPwdForm(s => !s)}
                        style={{ borderColor: '#0284c7', background: showPwdForm ? '#f0f9ff' : '#0284c7', color: showPwdForm ? '#0284c7' : '#fff' }}>
                        {showPwdForm ? 'Annuler' : 'Modifier'}
                    </button>
                </div>

                {showPwdForm && (
                    <div style={{ paddingTop: 14, borderTop: '1px solid #f0f9ff', display: 'flex', flexDirection: 'column', gap: 12 }}>
                        <div>
                            <label className="aprofil-label">Ancien mot de passe</label>
                            <input type="password" className="aprofil-input" value={ancienMdp} onChange={e => setAncienMdp(e.target.value)} />
                        </div>
                        <div>
                            <label className="aprofil-label">Nouveau mot de passe</label>
                            <input type="password" className="aprofil-input" value={nouveauMdp} onChange={e => setNouveauMdp(e.target.value)} placeholder="Min. 8 caractères" />
                        </div>
                        <div>
                            <label className="aprofil-label">Confirmer le nouveau mot de passe</label>
                            <input type="password" className="aprofil-input" value={confirmMdp} onChange={e => setConfirmMdp(e.target.value)} />
                        </div>
                        <button className="aprofil-btn" onClick={changerMotDePasse} disabled={savingPwd}
                            style={{ borderColor: '#16a34a', background: '#16a34a', color: '#fff', alignSelf: 'flex-start' }}>
                            {savingPwd ? 'Modification...' : 'Modifier le mot de passe'}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}