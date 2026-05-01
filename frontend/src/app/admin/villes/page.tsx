'use client';
import { useEffect, useState } from 'react';
import { api } from '@/lib/api';

const VILLES_DEFAUT = [
  'Cotonou','Porto-Novo','Parakou','Abomey-Calavi','Bohicon',
  'Natitingou','Lokossa','Ouidah','Kandi','Djougou',
  'Abomey','Malanville','Nikki','Savalou','Bassila',
];

interface Ville {
  id: string;
  nom: string;
  active: boolean;
  nbAnnonces: number;
  nbUtilisateurs: number;
}

export default function AdminVilles() {
  const [villes, setVilles] = useState<Ville[]>([]);
  const [loading, setLoading] = useState(true);
  const [newVille, setNewVille] = useState('');
  const [search, setSearch] = useState('');
  const [saving, setSaving] = useState<string | null>(null);
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);
  const [showAdd, setShowAdd] = useState(false);

  const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  useEffect(() => {
    load();
  }, []);

  const load = async () => {
    setLoading(true);
    try {
      const r = await api.get('/admin/villes');
      setVilles(r.data);
    } catch {
      // Si l'endpoint n'existe pas encore, on construit depuis les stats
      try {
        const [statsR, annoncesR] = await Promise.all([
          api.get('/admin/stats'),
          api.get('/admin/annonces', { params: { limit: 100, page: 1 } }),
        ]);
        const parVille: Record<string, { annonces: number; utilisateurs: number }> = {};
        (annoncesR.data.annonces || []).forEach((a: any) => {
          if (!a.ville) return;
          if (!parVille[a.ville]) parVille[a.ville] = { annonces: 0, utilisateurs: 0 };
          parVille[a.ville].annonces++;
        });
        (statsR.data.parVille || []).forEach((v: any) => {
          if (!v.ville) return;
          if (!parVille[v.ville]) parVille[v.ville] = { annonces: 0, utilisateurs: 0 };
          parVille[v.ville].utilisateurs = v._count || 0;
        });
        const villesConnues = new Set([...Object.keys(parVille), ...VILLES_DEFAUT]);
        const built: Ville[] = Array.from(villesConnues).map(nom => ({
          id: nom,
          nom,
          active: true,
          nbAnnonces: parVille[nom]?.annonces || 0,
          nbUtilisateurs: parVille[nom]?.utilisateurs || 0,
        })).sort((a, b) => b.nbAnnonces - a.nbAnnonces);
        setVilles(built);
      } catch {}
    } finally { setLoading(false); }
  };

  const toggleVille = async (ville: Ville) => {
    setSaving(ville.id);
    const newActive = !ville.active;
    try {
      await api.put(`/admin/villes/${encodeURIComponent(ville.nom)}`, { active: newActive });
    } catch {
      // Pas d'endpoint : mise à jour locale uniquement
    }
    setVilles(prev => prev.map(v => v.id === ville.id ? { ...v, active: newActive } : v));
    showToast(`${ville.nom} ${newActive ? 'activée' : 'désactivée'}`);
    setSaving(null);
  };

  const ajouterVille = () => {
    const nom = newVille.trim();
    if (!nom) return;
    if (villes.some(v => v.nom.toLowerCase() === nom.toLowerCase())) {
      showToast('Cette ville existe déjà', 'error');
      return;
    }
    const nouvelle: Ville = { id: nom, nom, active: true, nbAnnonces: 0, nbUtilisateurs: 0 };
    setVilles(prev => [nouvelle, ...prev]);
    setNewVille('');
    setShowAdd(false);
    showToast(`${nom} ajoutée avec succès`);
    api.post('/admin/villes', { nom, active: true }).catch(() => {});
  };

  const supprimerVille = async (ville: Ville) => {
    if (!confirm(`Supprimer ${ville.nom} ? Les annonces existantes ne seront pas affectées.`)) return;
    if (ville.nbAnnonces > 0) {
      showToast(`Impossible : ${ville.nbAnnonces} annonce(s) dans cette ville`, 'error');
      return;
    }
    setVilles(prev => prev.filter(v => v.id !== ville.id));
    showToast(`${ville.nom} supprimée`);
    api.delete(`/admin/villes/${encodeURIComponent(ville.nom)}`).catch(() => {});
  };

  const filtered = villes.filter(v => v.nom.toLowerCase().includes(search.toLowerCase()));
  const actives = villes.filter(v => v.active).length;
  const totalAnnonces = villes.reduce((s, v) => s + v.nbAnnonces, 0);

  return (
    <div style={{ fontFamily: "'Syne',sans-serif" }}>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg) } }
        @keyframes drop { from { opacity:0; transform:translateY(-8px) } to { opacity:1; transform:translateY(0) } }
        .ville-card { background:#fff; border:1px solid #e0f2fe; border-radius:14px; padding:16px 18px; display:flex; align-items:center; gap:14px; transition:box-shadow .2s, border-color .2s; }
        .ville-card:hover { box-shadow:0 4px 16px rgba(2,132,199,0.1); border-color:#bae6fd; }
        .ville-card.inactive { opacity:0.55; background:#f8fafc; }
        .toggle { width:44px; height:24px; border-radius:12px; border:none; cursor:pointer; position:relative; transition:background .2s; flex-shrink:0; }
        .toggle::after { content:''; position:absolute; top:3px; width:18px; height:18px; background:#fff; border-radius:50%; transition:left .2s; box-shadow:0 1px 4px rgba(0,0,0,0.2); }
        .toggle.on { background:#0284c7; }
        .toggle.on::after { left:23px; }
        .toggle.off { background:#cbd5e1; }
        .toggle.off::after { left:3px; }
        .btn { padding:7px 16px; border-radius:10px; border:1px solid; cursor:pointer; font-size:12px; font-weight:600; font-family:"Syne",sans-serif; transition:all .2s; }
        .ville-grid { display:grid; grid-template-columns:repeat(3,1fr); gap:12px; }
        .stat-mini { background:#fff; border:1px solid #e0f2fe; border-radius:12px; padding:16px; text-align:center; }
        @media(max-width:1024px) { .ville-grid { grid-template-columns:repeat(2,1fr); } }
        @media(max-width:640px)  { .ville-grid { grid-template-columns:1fr; } }
      `}</style>

      {/* Toast */}
      {toast && (
        <div style={{ position: 'fixed', bottom: 24, right: 24, zIndex: 9999, background: toast.type === 'success' ? '#065f46' : '#991b1b', color: '#fff', padding: '12px 20px', borderRadius: 12, fontSize: 13, fontWeight: 600, boxShadow: '0 4px 20px rgba(0,0,0,0.2)', animation: 'drop .3s ease' }}>
          {toast.type === 'success' ? '✓' : '✕'} {toast.msg}
        </div>
      )}

      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <div style={{ fontSize: 10, color: '#0284c7', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: 6 }}>Administration</div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: 12 }}>
          <div>
            <h1 style={{ fontSize: 28, fontWeight: 800, color: '#0c4a6e', margin: 0 }}>Gestion des villes</h1>
            <p style={{ color: '#64748b', fontSize: 13, marginTop: 4 }}>Configurer les villes disponibles sur la plateforme</p>
          </div>
          <button className="btn" onClick={() => setShowAdd(s => !s)}
            style={{ borderColor: '#0284c7', background: '#0284c7', color: '#fff' }}>
            + Ajouter une ville
          </button>
        </div>
      </div>

      {/* Formulaire ajout */}
      {showAdd && (
        <div style={{ background: '#fff', border: '1px solid #bae6fd', borderRadius: 14, padding: 20, marginBottom: 14, animation: 'drop .2s ease' }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: '#0c4a6e', marginBottom: 12 }}>Nouvelle ville</div>
          <div style={{ display: 'flex', gap: 10 }}>
            <input
              value={newVille}
              onChange={e => setNewVille(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && ajouterVille()}
              placeholder="Nom de la ville (ex: Lokossa)"
              style={{ flex: 1, background: '#f0f9ff', border: '1px solid #bae6fd', borderRadius: 10, padding: '9px 14px', color: '#0c4a6e', fontSize: 13, outline: 'none', fontFamily: "'Syne',sans-serif" }}
              autoFocus
            />
            <button className="btn" onClick={ajouterVille} style={{ borderColor: '#16a34a', background: '#16a34a', color: '#fff' }}>Ajouter</button>
            <button className="btn" onClick={() => { setShowAdd(false); setNewVille(''); }} style={{ borderColor: '#e0f2fe', background: '#f0f9ff', color: '#64748b' }}>Annuler</button>
          </div>
          <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 8 }}>💡 Appuie sur Entrée pour valider rapidement</div>
        </div>
      )}

      {/* Stats rapides */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12, marginBottom: 20 }}>
        {[
          { label: 'Villes actives', val: actives, icon: '✅', color: '#16a34a' },
          { label: 'Villes inactives', val: villes.length - actives, icon: '⏸️', color: '#94a3b8' },
          { label: 'Total annonces', val: totalAnnonces, icon: '🏘️', color: '#0284c7' },
        ].map((s, i) => (
          <div key={i} className="stat-mini">
            <div style={{ fontSize: 24, marginBottom: 6 }}>{s.icon}</div>
            <div style={{ fontSize: 22, fontWeight: 800, color: s.color, fontFamily: 'monospace' }}>{s.val}</div>
            <div style={{ fontSize: 11, color: '#64748b', marginTop: 2 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Recherche */}
      <div style={{ position: 'relative', marginBottom: 16 }}>
        <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} style={{width:16,height:16}}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </span>
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Rechercher une ville..."
          style={{ width: '100%', background: '#fff', border: '1px solid #bae6fd', borderRadius: 12, padding: '10px 14px 10px 38px', color: '#0c4a6e', fontSize: 13, outline: 'none', fontFamily: "'Syne',sans-serif", boxSizing: 'border-box' }} />
      </div>

      {/* Filtre actives/toutes */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 16, flexWrap: 'wrap' }}>
        <span style={{ fontSize: 12, color: '#94a3b8', alignSelf: 'center' }}>{filtered.length} ville(s)</span>
      </div>

      {/* Liste */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px 20px' }}>
          <div style={{ width: 32, height: 32, border: '3px solid #0284c7', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin .8s linear infinite', margin: '0 auto' }} />
        </div>
      ) : (
        <div className="ville-grid">
          {filtered.map(ville => (
            <div key={ville.id} className={`ville-card${!ville.active ? ' inactive' : ''}`}>
              {/* Icone ville */}
              <div style={{ width: 42, height: 42, borderRadius: 12, background: ville.active ? '#e0f2fe' : '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0 }}>
                📍
              </div>

              {/* Infos */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: ville.active ? '#0c4a6e' : '#94a3b8', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{ville.nom}</div>
                <div style={{ display: 'flex', gap: 10, marginTop: 4, flexWrap: 'wrap' }}>
                  {ville.nbAnnonces > 0 && (
                    <span style={{ fontSize: 10, color: '#0284c7', background: '#e0f2fe', padding: '1px 7px', borderRadius: 10 }}>🏘️ {ville.nbAnnonces} annonce{ville.nbAnnonces > 1 ? 's' : ''}</span>
                  )}
                  {ville.nbUtilisateurs > 0 && (
                    <span style={{ fontSize: 10, color: '#16a34a', background: '#d1fae5', padding: '1px 7px', borderRadius: 10 }}>👥 {ville.nbUtilisateurs} utilisateur{ville.nbUtilisateurs > 1 ? 's' : ''}</span>
                  )}
                  {ville.nbAnnonces === 0 && ville.nbUtilisateurs === 0 && (
                    <span style={{ fontSize: 10, color: '#94a3b8' }}>Aucune activité</span>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 8, flexShrink: 0 }}>
                <button
                  className={`toggle ${ville.active ? 'on' : 'off'}`}
                  onClick={() => toggleVille(ville)}
                  disabled={saving === ville.id}
                  title={ville.active ? 'Désactiver' : 'Activer'}
                />
                {ville.nbAnnonces === 0 && (
                  <button onClick={() => supprimerVille(ville)}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#fca5a5', fontSize: 16, padding: 0, lineHeight: 1 }}
                    title="Supprimer">✕</button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Note backend */}
      <div style={{ marginTop: 24, padding: '14px 18px', background: '#fefce8', border: '1px solid #fde047', borderRadius: 12, fontSize: 12, color: '#92400e' }}>
        <strong>⚠️ Note backend :</strong> Pour que l'activation/désactivation soit persistante, crée les routes <code>GET /admin/villes</code>, <code>POST /admin/villes</code>, <code>PUT /admin/villes/:nom</code> et <code>DELETE /admin/villes/:nom</code>. En attendant, les changements sont appliqués localement.
      </div>
    </div>
  );
}
