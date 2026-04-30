'use client';
import { useEffect, useState } from 'react';
import api from '@/lib/api';

const fmt = (n: number) => n.toLocaleString('fr-FR');
const fmtF = (n: number) => n.toLocaleString('fr-FR') + ' FCFA';

function Kpi({ label, val, sub, trend, color = '#10B981', icon }: any) {
  const pos = trend >= 0;
  return (
    <div style={{ background: '#080F1C', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 16, padding: 22, position: 'relative', overflow: 'hidden', cursor: 'default', transition: 'border-color .2s' }}
      onMouseEnter={e => (e.currentTarget.style.borderColor = color + '50')}
      onMouseLeave={e => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)')}>
      <div style={{ position: 'absolute', top: 0, right: 0, width: 110, height: 110, background: `radial-gradient(circle at 100% 0%,${color}18,transparent 70%)`, pointerEvents: 'none' }} />
      <div style={{ fontSize: 26, marginBottom: 10 }}>{icon}</div>
      <div style={{ fontSize: 10, color: '#475569', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: 6 }}>{label}</div>
      <div style={{ fontSize: 30, fontWeight: 800, color: '#F1F5F9', letterSpacing: '-1px', marginBottom: 8, fontFamily: "'JetBrains Mono',monospace" }}>{val}</div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        {trend !== undefined && <span style={{ fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 20, color: pos ? '#10B981' : '#EF4444', background: pos ? 'rgba(16,185,129,.1)' : 'rgba(239,68,68,.1)' }}>{pos ? '↑' : '↓'} {Math.abs(trend)}%</span>}
        {sub && <span style={{ fontSize: 11, color: '#475569' }}>{sub}</span>}
      </div>
    </div>
  );
}

function Bars({ data }: { data: any[] }) {
  if (!data?.length) return null;
  const max = Math.max(...data.map(d => d.abonnements), 1);
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 10, height: 80 }}>
      {data.map((d, i) => (
        <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
          <div style={{ width: '100%', background: 'linear-gradient(180deg,#10B981,#059669)', borderRadius: '4px 4px 0 0', height: `${(d.abonnements / max) * 64 || 4}px`, minHeight: 4, opacity: .4 + .6 * (i / Math.max(data.length - 1, 1)), transition: 'height .4s' }} />
          <div style={{ fontSize: 10, color: '#334155', textTransform: 'capitalize' }}>{d.mois}</div>
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
    ]).then(([s, a]) => {
      if (s.data) setStats(s.data);
      if (a.data) setActivite(a.data);
    });
  }, []);

  return (
    <div style={{ maxWidth: 1160 }}>
      <div style={{ marginBottom: 36 }}>
        <div style={{ fontSize: 10, color: '#10B981', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: 6 }}>Tableau de bord</div>
        <h1 style={{ fontSize: 34, fontWeight: 800, color: '#F1F5F9', margin: 0, letterSpacing: '-1px' }}>Vue d'ensemble</h1>
        <p style={{ color: '#475569', marginTop: 6, fontSize: 13 }}>Données en temps réel — {new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 14, marginBottom: 14 }}>
        <Kpi label="Utilisateurs actifs" val={fmt(stats.utilisateurs.total)} trend={stats.utilisateurs.evolution} sub={`+${stats.utilisateurs.nouveauxCeMois} ce mois`} icon="👥" />
        <Kpi label="Abonnements actifs" val={fmt(stats.abonnements.actifs)} trend={stats.abonnements.evolution} sub={`+${stats.abonnements.ceMois} ce mois`} icon="✅" color="#3B82F6" />
        <Kpi label="Revenus ce mois" val={fmtF(stats.revenus.ceMois)} trend={stats.revenus.evolution} sub={`Total: ${fmtF(stats.revenus.total)}`} icon="💰" color="#F59E0B" />
        <Kpi label="Colocations actives" val={fmt(stats.colocations.actives)} icon="🏠" color="#8B5CF6" sub={`${stats.colocations.tauxSucces}% taux succès`} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 14, marginBottom: 14 }}>
        <Kpi label="Annonces actives" val={fmt(stats.annonces.actives)} icon="📋" color="#EC4899" sub={`${fmt(stats.annonces.total)} total`} />
        <Kpi label="Demandes colocation" val={fmt(stats.colocations.total)} icon="🤝" color="#06B6D4" sub={`${stats.colocations.tauxSucces}% acceptées`} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 14, marginBottom: 14 }}>
        <div style={{ background: '#080F1C', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 16, padding: 22 }}>
          <div style={{ fontSize: 10, color: '#475569', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: 4 }}>Évolution 6 mois</div>
          <div style={{ fontSize: 17, fontWeight: 700, color: '#F1F5F9', marginBottom: 20 }}>Abonnements</div>
          <Bars data={stats.evolutionMois} />
          <div style={{ display: 'flex', gap: 12, marginTop: 16, paddingTop: 14, borderTop: '1px solid rgba(255,255,255,0.05)' }}>
            {stats.evolutionMois.slice(-3).map((d: any, i: number) => (
              <div key={i} style={{ flex: 1, textAlign: 'center' }}>
                <div style={{ fontSize: 20, fontWeight: 800, color: '#10B981', fontFamily: "'JetBrains Mono',monospace" }}>{d.abonnements}</div>
                <div style={{ fontSize: 10, color: '#475569', textTransform: 'capitalize' }}>{d.mois}</div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ background: '#080F1C', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 16, padding: 22 }}>
          <div style={{ fontSize: 10, color: '#475569', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: 4 }}>Top villes</div>
          <div style={{ fontSize: 17, fontWeight: 700, color: '#F1F5F9', marginBottom: 20 }}>Répartition</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {stats.parVille.map((v: any, i: number) => {
              const tot = stats.parVille.reduce((s: number, x: any) => s + x._count, 0);
              const pct = tot > 0 ? Math.round((v._count / tot) * 100) : 0;
              const cols = ['#10B981', '#3B82F6', '#F59E0B', '#8B5CF6', '#EC4899'];
              return (
                <div key={i}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                    <span style={{ fontSize: 12, color: '#CBD5E1' }}>{v.ville || '—'}</span>
                    <span style={{ fontSize: 11, fontWeight: 700, color: cols[i], fontFamily: "'JetBrains Mono',monospace" }}>{pct}%</span>
                  </div>
                  <div style={{ height: 4, background: 'rgba(255,255,255,0.05)', borderRadius: 2 }}>
                    <div style={{ height: '100%', width: `${pct}%`, background: cols[i], borderRadius: 2, transition: 'width .5s' }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
        <div style={{ background: '#080F1C', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 16, padding: 22 }}>
          <div style={{ fontSize: 10, color: '#475569', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: 16 }}>Derniers inscrits</div>
          {activite?.recentUsers?.map((u: any) => (
            <div key={u.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
              <div style={{ width: 34, height: 34, borderRadius: '50%', background: 'linear-gradient(135deg,#10B981,#3B82F6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, color: '#fff', flexShrink: 0 }}>
                {u.prenom?.[0]}{u.nom?.[0]}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: '#E2E8F0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{u.prenom} {u.nom}</div>
                <div style={{ fontSize: 11, color: '#475569' }}>{u.email}</div>
              </div>
              <span style={{ fontSize: 10, color: '#10B981', background: 'rgba(16,185,129,.1)', padding: '2px 8px', borderRadius: 20, flexShrink: 0 }}>{u.typeCompte}</span>
            </div>
          ))}
        </div>

        <div style={{ background: '#080F1C', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 16, padding: 22 }}>
          <div style={{ fontSize: 10, color: '#475569', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: 16 }}>Dernières annonces</div>
          {activite?.recentAnnonces?.map((a: any) => (
            <div key={a.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
              <div style={{ width: 34, height: 34, borderRadius: 8, background: 'rgba(59,130,246,.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, flexShrink: 0 }}>🏘️</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: '#E2E8F0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{a.ville}{a.quartier ? `, ${a.quartier}` : ''}</div>
                <div style={{ fontSize: 11, color: '#475569' }}>{a.proprietaire?.prenom} {a.proprietaire?.nom} · {(a.loyerTotal || 0).toLocaleString()} F</div>
              </div>
              <span style={{ fontSize: 10, padding: '2px 8px', borderRadius: 20, flexShrink: 0, color: a.statut === 'ACTIVE' ? '#10B981' : '#F59E0B', background: a.statut === 'ACTIVE' ? 'rgba(16,185,129,.1)' : 'rgba(245,158,11,.1)' }}>{a.statut}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}