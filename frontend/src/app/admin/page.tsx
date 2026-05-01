'use client';
import { useEffect, useState } from 'react';
import { api } from '@/lib/api';

const fmt = (n: number) => n.toLocaleString('fr-FR');
const fmtF = (n: number) => n.toLocaleString('fr-FR') + ' FCFA';

function Kpi({ label, val, sub, trend, color = '#0284c7', icon }: any) {
  const pos = trend >= 0;
  return (
    <div className="kpi-card" style={{ '--accent': color } as any}>
      <div className="kpi-glow" />
      <div style={{ fontSize: 28, marginBottom: 10 }}>{icon}</div>
      <div style={{ fontSize: 10, color: '#0369a1', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: 6, fontWeight: 600 }}>{label}</div>
      <div style={{ fontSize: 26, fontWeight: 800, color: '#0c4a6e', letterSpacing: '-1px', marginBottom: 8, fontFamily: 'monospace' }}>{val}</div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
        {trend !== undefined && (
          <span style={{ fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 20, color: pos ? '#065f46' : '#991b1b', background: pos ? '#d1fae5' : '#fee2e2' }}>
            {pos ? '↑' : '↓'} {Math.abs(trend)}%
          </span>
        )}
        {sub && <span style={{ fontSize: 11, color: '#64748b' }}>{sub}</span>}
      </div>
    </div>
  );
}

function Bars({ data }: { data: any[] }) {
  if (!data?.length) return null;
  const max = Math.max(...data.map((d: any) => d.abonnements), 1);
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8, height: 80 }}>
      {data.map((d: any, i: number) => (
        <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
          <div style={{ width: '100%', background: 'linear-gradient(180deg,#0284c7,#0369a1)', borderRadius: '4px 4px 0 0', height: `${(d.abonnements / max) * 64 || 4}px`, minHeight: 4, opacity: .3 + .7 * (i / Math.max(data.length - 1, 1)), transition: 'height .4s' }} />
          <div style={{ fontSize: 10, color: '#64748b', textTransform: 'capitalize', whiteSpace: 'nowrap' }}>{d.mois}</div>
        </div>
      ))}
    </div>
  );
}

export default function AdminPage() {
  const [stats, setStats] = useState<any>(null);
  const [activite, setActivite] = useState<any>(null);

  useEffect(() => {
    Promise.all([
      api.get('/admin/stats').catch(() => ({ data: null })),
      api.get('/admin/activite').catch(() => ({ data: null })),
    ]).then(([s, a]) => { if (s.data) setStats(s.data); if (a.data) setActivite(a.data); });
  }, []);

  if (!stats) return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
      <div style={{ width: 36, height: 36, border: '3px solid #0284c7', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin .8s linear infinite' }} />
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );

  return (
    <>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg) } }

        .kpi-card {
          background: #fff;
          border: 1px solid #e0f2fe;
          border-radius: 16px;
          padding: 20px;
          position: relative;
          overflow: hidden;
          box-shadow: 0 1px 4px rgba(0,0,0,0.06);
          transition: box-shadow .2s, transform .2s;
        }
        .kpi-card:hover { box-shadow: 0 4px 16px rgba(2,132,199,0.12); transform: translateY(-2px); }
        .kpi-glow {
          position: absolute; top: 0; right: 0;
          width: 90px; height: 90px;
          background: radial-gradient(circle at 100% 0%, var(--accent, #0284c7)18, transparent 70%);
          pointer-events: none;
        }

        .grid-4 { display:grid; grid-template-columns:repeat(4,1fr); gap:14px; margin-bottom:14px; }
        .grid-2 { display:grid; grid-template-columns:repeat(2,1fr); gap:14px; margin-bottom:14px; }
        .grid-bottom { display:grid; grid-template-columns:1fr 1fr; gap:14px; }

        .panel {
          background: #fff;
          border: 1px solid #e0f2fe;
          border-radius: 16px;
          padding: 20px;
          box-shadow: 0 1px 4px rgba(0,0,0,0.06);
        }
        .panel-title {
          font-size: 10px; color: #0369a1; letter-spacing: 2px;
          text-transform: uppercase; margin-bottom: 16px; font-weight: 700;
        }
        .row-item {
          display: flex; align-items: center; gap: 10px;
          padding: 8px 0; border-bottom: 1px solid #f0f9ff;
        }
        .row-item:last-child { border-bottom: none; }
        .avatar {
          width: 34px; height: 34px; border-radius: 50%;
          background: linear-gradient(135deg,#0284c7,#0ea5e9);
          display: flex; align-items: center; justify-content: center;
          font-size: 12px; font-weight: 700; color: #fff; flex-shrink: 0;
        }
        .badge { font-size: 10px; font-weight: 600; padding: 2px 9px; border-radius: 20px; flex-shrink: 0; }

        @media(max-width:1100px) { .grid-4 { grid-template-columns:repeat(2,1fr); } }
        @media(max-width:768px) {
          .grid-4 { grid-template-columns:repeat(2,1fr); gap:10px; margin-bottom:10px; }
          .grid-2 { grid-template-columns:repeat(2,1fr); gap:10px; margin-bottom:10px; }
          .grid-bottom { grid-template-columns:1fr; gap:10px; }
        }
        @media(max-width:480px) {
          .grid-4 { grid-template-columns:1fr; }
          .grid-2 { grid-template-columns:1fr; }
        }
      `}</style>

      {/* Header */}
      <div style={{ marginBottom: 32 }}>
        <div style={{ fontSize: 10, color: '#0284c7', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: 6 }}>Tableau de bord</div>
        <h1 style={{ fontSize: 28, fontWeight: 800, color: '#0c4a6e', margin: 0 }}>Vue d'ensemble</h1>
        <p style={{ color: '#64748b', marginTop: 6, fontSize: 13 }}>
          Données en temps réel — {new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
        </p>
      </div>

      {/* KPI 4 */}
      <div className="grid-4">
        <Kpi label="Utilisateurs actifs" val={fmt(stats.utilisateurs.total)} trend={stats.utilisateurs.evolution} sub={`+${stats.utilisateurs.nouveauxCeMois} ce mois`} icon="👥" color="#0284c7" />
        <Kpi label="Abonnements actifs" val={fmt(stats.abonnements.actifs)} trend={stats.abonnements.evolution} sub={`+${stats.abonnements.ceMois} ce mois`} icon="✅" color="#16a34a" />
        <Kpi label="Revenus ce mois" val={fmtF(stats.revenus.ceMois)} trend={stats.revenus.evolution} sub={`Total: ${fmtF(stats.revenus.total)}`} icon="💰" color="#d97706" />
        <Kpi label="Colocations actives" val={fmt(stats.colocations.actives)} icon="🏠" color="#7c3aed" sub={`${stats.colocations.tauxSucces}% taux succès`} />
      </div>

      {/* KPI 2 */}
      <div className="grid-2">
        <Kpi label="Annonces actives" val={fmt(stats.annonces.actives)} icon="📋" color="#db2777" sub={`${fmt(stats.annonces.total)} total`} />
        <Kpi label="Demandes colocation" val={fmt(stats.colocations.total)} icon="🤝" color="#0891b2" sub={`${stats.colocations.tauxSucces}% acceptées`} />
      </div>

      {/* Panneaux */}
      <div className="grid-bottom">

        {/* Graphique */}
        <div className="panel">
          <p className="panel-title">Abonnements — 6 derniers mois</p>
          <Bars data={stats.evolutionMois || []} />
          <div style={{ display: 'flex', gap: 12, marginTop: 16, paddingTop: 14, borderTop: '1px solid #e0f2fe' }}>
            {(stats.evolutionMois || []).slice(-3).map((d: any, i: number) => (
              <div key={i} style={{ flex: 1, textAlign: 'center' }}>
                <div style={{ fontSize: 20, fontWeight: 800, color: '#0284c7', fontFamily: 'monospace' }}>{d.abonnements}</div>
                <div style={{ fontSize: 10, color: '#64748b', textTransform: 'capitalize' }}>{d.mois}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Top villes */}
        <div className="panel">
          <p className="panel-title">Top villes</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {(stats.parVille || []).map((v: any, i: number) => {
              const tot = (stats.parVille || []).reduce((s: number, x: any) => s + x._count, 0);
              const pct = tot > 0 ? Math.round((v._count / tot) * 100) : 0;
              const cols = ['#0284c7','#16a34a','#d97706','#7c3aed','#db2777'];
              return (
                <div key={i}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                    <span style={{ fontSize: 12, color: '#0c4a6e', fontWeight: 500 }}>{v.ville || '—'}</span>
                    <span style={{ fontSize: 11, fontWeight: 700, color: cols[i] }}>{pct}%</span>
                  </div>
                  <div style={{ height: 5, background: '#e0f2fe', borderRadius: 3 }}>
                    <div style={{ height: '100%', width: `${pct}%`, background: cols[i], borderRadius: 3, transition: 'width .5s' }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Derniers inscrits */}
        <div className="panel">
          <p className="panel-title">Derniers inscrits</p>
          {(activite?.recentUsers || []).map((u: any) => (
            <div key={u.id} className="row-item">
              <div className="avatar">{u.prenom?.[0]}{u.nom?.[0]}</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: '#0c4a6e', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{u.prenom} {u.nom}</div>
                <div style={{ fontSize: 11, color: '#64748b', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{u.email}</div>
              </div>
              <span className="badge" style={{
                color: u.typeCompte === 'ADMIN' ? '#92400e' : u.typeCompte === 'PROPRIETAIRE' ? '#1e40af' : '#065f46',
                background: u.typeCompte === 'ADMIN' ? '#fef3c7' : u.typeCompte === 'PROPRIETAIRE' ? '#dbeafe' : '#d1fae5'
              }}>{u.typeCompte}</span>
            </div>
          ))}
        </div>

        {/* Dernières annonces */}
        <div className="panel">
          <p className="panel-title">Dernières annonces</p>
          {(activite?.recentAnnonces || []).map((a: any) => (
            <div key={a.id} className="row-item">
              <div style={{ width: 34, height: 34, borderRadius: 8, background: '#e0f2fe', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, flexShrink: 0 }}>🏘️</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: '#0c4a6e', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{a.ville}{a.quartier ? `, ${a.quartier}` : ''}</div>
                <div style={{ fontSize: 11, color: '#64748b' }}>{a.proprietaire?.prenom} {a.proprietaire?.nom} · {(a.loyerTotal || 0).toLocaleString()} F</div>
              </div>
              <span className="badge" style={{ color: a.statut === 'ACTIVE' ? '#065f46' : '#92400e', background: a.statut === 'ACTIVE' ? '#d1fae5' : '#fef3c7' }}>{a.statut}</span>
            </div>
          ))}
        </div>

      </div>
    </>
  );
}
