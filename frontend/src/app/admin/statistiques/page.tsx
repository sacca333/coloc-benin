'use client';
import { useEffect, useState } from 'react';
import { api } from '@/lib/api';

const MOIS = ['Jan','Fév','Mar','Avr','Mai','Jun','Jul','Aoû','Sep','Oct','Nov','Déc'];

function LineChart({ data, color = '#0284c7', label }: { data: number[]; color?: string; label: string }) {
  if (!data.length) return null;
  const max = Math.max(...data, 1);
  const W = 600; const H = 120; const PAD = 24;
  const pts = data.map((v, i) => {
    const x = PAD + (i / Math.max(data.length - 1, 1)) * (W - PAD * 2);
    const y = H - PAD - (v / max) * (H - PAD * 2);
    return `${x},${y}`;
  });
  const area = `M${pts.join(' L')} L${PAD + (W - PAD * 2)},${H - PAD} L${PAD},${H - PAD} Z`;
  const line = `M${pts.join(' L')}`;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', height: 'auto', overflow: 'visible' }}>
      <defs>
        <linearGradient id={`g-${label}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.18" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      {/* Grille horizontale */}
      {[0,1,2,3].map(i => {
        const y = PAD + (i / 3) * (H - PAD * 2);
        return <line key={i} x1={PAD} y1={y} x2={W - PAD} y2={y} stroke="#e0f2fe" strokeWidth={1} />;
      })}
      {/* Aire */}
      <path d={area} fill={`url(#g-${label})`} />
      {/* Ligne */}
      <path d={line} fill="none" stroke={color} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />
      {/* Points */}
      {pts.map((pt, i) => {
        const [x, y] = pt.split(',').map(Number);
        return (
          <g key={i}>
            <circle cx={x} cy={y} r={4} fill="#fff" stroke={color} strokeWidth={2} />
            <title>{data[i]}</title>
          </g>
        );
      })}
    </svg>
  );
}

function BarChart({ data, colors }: { data: { label: string; value: number; color: string }[]; colors?: string[] }) {
  const max = Math.max(...data.map(d => d.value), 1);
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8, height: 120 }}>
      {data.map((d, i) => (
        <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: d.color }}>{d.value}</div>
          <div style={{ width: '100%', background: '#f0f9ff', borderRadius: '6px 6px 0 0', height: 80, display: 'flex', alignItems: 'flex-end' }}>
            <div style={{ width: '100%', background: d.color, borderRadius: '6px 6px 0 0', height: `${(d.value / max) * 100}%`, minHeight: 4, transition: 'height .5s ease', opacity: 0.85 }} />
          </div>
          <div style={{ fontSize: 10, color: '#64748b', textAlign: 'center', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '100%' }}>{d.label}</div>
        </div>
      ))}
    </div>
  );
}

function Delta({ val, prev }: { val: number; prev: number }) {
  if (!prev) return null;
  const pct = Math.round(((val - prev) / prev) * 100);
  const pos = pct >= 0;
  return (
    <span style={{ fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 20, color: pos ? '#065f46' : '#991b1b', background: pos ? '#d1fae5' : '#fee2e2', marginLeft: 8 }}>
      {pos ? '↑' : '↓'} {Math.abs(pct)}%
    </span>
  );
}

export default function AdminStats() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [periode, setPeriode] = useState<'6'|'12'>('12');

  useEffect(() => {
    api.get('/admin/stats').then(r => { setStats(r.data); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
      <div style={{ width: 36, height: 36, border: '3px solid #0284c7', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin .8s linear infinite' }} />
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );

  if (!stats) return (
    <div style={{ textAlign: 'center', padding: '60px 20px', color: '#64748b' }}>
      <div style={{ fontSize: 40, marginBottom: 12 }}>📊</div>
      <div>Impossible de charger les statistiques</div>
    </div>
  );

  const evolution: any[] = stats.evolutionMois || [];
  const slice = periode === '6' ? evolution.slice(-6) : evolution.slice(-12);
  const aboData = slice.map((d: any) => d.abonnements || 0);
  const revData = slice.map((d: any) => d.revenus || 0);
  const moisLabels = slice.map((d: any) => d.mois || '');

  // Comparaison mois en cours vs mois précédent
  const moisN = evolution[evolution.length - 1] || {};
  const moisN1 = evolution[evolution.length - 2] || {};

  const parVille: any[] = stats.parVille || [];
  const villeData = parVille.slice(0, 6).map((v: any, i: number) => ({
    label: v.ville || '—',
    value: v._count || 0,
    color: ['#0284c7','#16a34a','#d97706','#7c3aed','#db2777','#0891b2'][i] || '#0284c7',
  }));

  const fmt = (n: number) => n?.toLocaleString('fr-FR') || '0';
  const fmtF = (n: number) => (n?.toLocaleString('fr-FR') || '0') + ' FCFA';

  return (
    <div style={{ fontFamily: "'Syne',sans-serif" }}>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg) } }
        .panel { background:#fff; border:1px solid #e0f2fe; border-radius:16px; padding:22px; box-shadow:0 1px 4px rgba(0,0,0,0.06); margin-bottom:14px; }
        .panel-title { font-size:10px; color:#0369a1; letter-spacing:2px; text-transform:uppercase; font-weight:700; margin-bottom:4px; }
        .panel-sub { font-size:17px; font-weight:700; color:#0c4a6e; margin-bottom:16px; }
        .grid-3 { display:grid; grid-template-columns:repeat(3,1fr); gap:14px; margin-bottom:14px; }
        .grid-2 { display:grid; grid-template-columns:repeat(2,1fr); gap:14px; margin-bottom:14px; }
        .kpi-mini { background:#fff; border:1px solid #e0f2fe; border-radius:14px; padding:18px; box-shadow:0 1px 4px rgba(0,0,0,0.05); }
        .tab-btn { padding:6px 16px; border-radius:20px; border:1px solid #bae6fd; background:#fff; color:#0369a1; font-size:12px; font-weight:600; cursor:pointer; font-family:"Syne",sans-serif; transition:all .2s; }
        .tab-btn.on { background:#0284c7; color:#fff; border-color:#0284c7; }
        @media(max-width:768px) { .grid-3{grid-template-columns:1fr;} .grid-2{grid-template-columns:1fr;} }
        @media(max-width:1024px) { .grid-3{grid-template-columns:repeat(2,1fr);} }
      `}</style>

      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <div style={{ fontSize: 10, color: '#0284c7', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: 6 }}>Administration</div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: 12 }}>
          <div>
            <h1 style={{ fontSize: 28, fontWeight: 800, color: '#0c4a6e', margin: 0 }}>Statistiques avancées</h1>
            <p style={{ color: '#64748b', fontSize: 13, marginTop: 4 }}>Analyse sur {periode} mois — mise à jour en temps réel</p>
          </div>
          <div style={{ display: 'flex', gap: 6 }}>
            <button className={`tab-btn${periode === '6' ? ' on' : ''}`} onClick={() => setPeriode('6')}>6 mois</button>
            <button className={`tab-btn${periode === '12' ? ' on' : ''}`} onClick={() => setPeriode('12')}>12 mois</button>
          </div>
        </div>
      </div>

      {/* Comparaison mois/mois */}
      <div className="panel">
        <div className="panel-title">Comparaison mois en cours vs mois précédent</div>
        <div className="panel-sub">Évolution mensuelle</div>
        <div className="grid-3">
          {[
            { label: 'Nouveaux inscrits', curr: moisN.utilisateurs || 0, prev: moisN1.utilisateurs || 0, icon: '👥', color: '#0284c7' },
            { label: 'Abonnements', curr: moisN.abonnements || 0, prev: moisN1.abonnements || 0, icon: '✅', color: '#16a34a' },
            { label: 'Revenus', curr: moisN.revenus || 0, prev: moisN1.revenus || 0, icon: '💰', color: '#d97706', isMoney: true },
          ].map((item, i) => (
            <div key={i} className="kpi-mini">
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                <span style={{ fontSize: 22 }}>{item.icon}</span>
                <span style={{ fontSize: 11, color: '#64748b', fontWeight: 500 }}>{item.label}</span>
              </div>
              <div style={{ fontSize: 26, fontWeight: 800, color: item.color, fontFamily: 'monospace', marginBottom: 6 }}>
                {item.isMoney ? fmtF(item.curr) : fmt(item.curr)}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#94a3b8' }}>
                Mois précédent : <strong style={{ color: '#475569' }}>{item.isMoney ? fmtF(item.prev) : fmt(item.prev)}</strong>
                <Delta val={item.curr} prev={item.prev} />
              </div>
              {/* Mini barre comparaison */}
              <div style={{ marginTop: 12, display: 'flex', gap: 4, alignItems: 'flex-end', height: 40 }}>
                {[item.prev, item.curr].map((v, j) => {
                  const maxV = Math.max(item.prev, item.curr, 1);
                  return (
                    <div key={j} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3 }}>
                      <div style={{ width: '100%', background: j === 1 ? item.color : '#e0f2fe', borderRadius: 4, height: `${(v / maxV) * 32}px`, minHeight: 4, transition: 'height .4s' }} />
                      <span style={{ fontSize: 9, color: '#94a3b8' }}>{j === 0 ? 'N-1' : 'N'}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Graphique abonnements */}
      <div className="grid-2">
        <div className="panel">
          <div className="panel-title">Abonnements</div>
          <div className="panel-sub">Évolution sur {periode} mois</div>
          <LineChart data={aboData} color="#0284c7" label="abo" />
          <div style={{ display: 'flex', gap: 8, marginTop: 8, overflowX: 'auto' }}>
            {moisLabels.map((m: string, i: number) => (
              <div key={i} style={{ flex: 1, textAlign: 'center', fontSize: 10, color: '#94a3b8', minWidth: 24 }}>{m}</div>
            ))}
          </div>
        </div>

        <div className="panel">
          <div className="panel-title">Revenus</div>
          <div className="panel-sub">Évolution sur {periode} mois</div>
          <LineChart data={revData} color="#16a34a" label="rev" />
          <div style={{ display: 'flex', gap: 8, marginTop: 8, overflowX: 'auto' }}>
            {moisLabels.map((m: string, i: number) => (
              <div key={i} style={{ flex: 1, textAlign: 'center', fontSize: 10, color: '#94a3b8', minWidth: 24 }}>{m}</div>
            ))}
          </div>
        </div>
      </div>

      {/* Répartition par ville */}
      <div className="panel">
        <div className="panel-title">Annonces par ville</div>
        <div className="panel-sub">Répartition géographique</div>
        <div className="grid-2" style={{ marginBottom: 0 }}>
          <BarChart data={villeData} />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, justifyContent: 'center' }}>
            {villeData.map((v, i) => {
              const total = villeData.reduce((s, x) => s + x.value, 0);
              const pct = total > 0 ? Math.round((v.value / total) * 100) : 0;
              return (
                <div key={i}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                    <span style={{ fontSize: 12, color: '#0c4a6e', fontWeight: 500 }}>{v.label}</span>
                    <span style={{ fontSize: 12, fontWeight: 700, color: v.color }}>{pct}% <span style={{ color: '#94a3b8', fontWeight: 400 }}>({v.value})</span></span>
                  </div>
                  <div style={{ height: 6, background: '#f0f9ff', borderRadius: 3 }}>
                    <div style={{ height: '100%', width: `${pct}%`, background: v.color, borderRadius: 3, transition: 'width .5s' }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Taux de conversion détaillé */}
      <div className="panel">
        <div className="panel-title">Entonnoir de conversion</div>
        <div className="panel-sub">De l'inscription à l'abonnement actif</div>
        {(() => {
          const inscrits = stats.utilisateurs?.total || 0;
          const actifs = stats.utilisateurs?.actifs || inscrits;
          const abonnes = stats.abonnements?.actifs || 0;
          const steps = [
            { label: 'Inscrits', value: inscrits, color: '#0284c7', pct: 100 },
            { label: 'Comptes actifs', value: actifs, color: '#16a34a', pct: inscrits > 0 ? Math.round((actifs / inscrits) * 100) : 0 },
            { label: 'Abonnés actifs', value: abonnes, color: '#d97706', pct: inscrits > 0 ? Math.round((abonnes / inscrits) * 100) : 0 },
          ];
          return (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {steps.map((s, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                  <div style={{ width: 100, fontSize: 12, color: '#0c4a6e', fontWeight: 500, flexShrink: 0 }}>{s.label}</div>
                  <div style={{ flex: 1, height: 28, background: '#f0f9ff', borderRadius: 8, overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${s.pct}%`, background: s.color, borderRadius: 8, display: 'flex', alignItems: 'center', paddingLeft: 10, transition: 'width .6s ease', minWidth: 40 }}>
                      <span style={{ fontSize: 11, fontWeight: 700, color: '#fff' }}>{s.pct}%</span>
                    </div>
                  </div>
                  <div style={{ width: 60, textAlign: 'right', fontSize: 13, fontWeight: 700, color: s.color, fontFamily: 'monospace', flexShrink: 0 }}>{s.value.toLocaleString('fr-FR')}</div>
                </div>
              ))}
            </div>
          );
        })()}
      </div>

      {/* KPIs globaux */}
      <div className="grid-3">
        {[
          { label: 'Total utilisateurs', val: fmt(stats.utilisateurs?.total || 0), icon: '👥', color: '#0284c7', sub: `+${fmt(stats.utilisateurs?.nouveauxCeMois || 0)} ce mois` },
          { label: 'Total abonnements', val: fmt((stats.abonnements?.actifs || 0) + (stats.abonnements?.expires || 0)), icon: '📋', color: '#16a34a', sub: `${fmt(stats.abonnements?.actifs || 0)} actifs` },
          { label: 'Revenu total', val: fmtF(stats.revenus?.total || 0), icon: '💰', color: '#d97706', sub: `${fmtF(stats.revenus?.ceMois || 0)} ce mois` },
          { label: 'Annonces actives', val: fmt(stats.annonces?.actives || 0), icon: '🏘️', color: '#7c3aed', sub: `${fmt(stats.annonces?.total || 0)} au total` },
          { label: 'Colocations', val: fmt(stats.colocations?.actives || 0), icon: '🏠', color: '#db2777', sub: `${stats.colocations?.tauxSucces || 0}% taux succès` },
          { label: 'Taux conversion', val: `${stats.utilisateurs?.total > 0 ? Math.round(((stats.abonnements?.actifs || 0) / stats.utilisateurs.total) * 100) : 0}%`, icon: '📈', color: '#0891b2', sub: 'inscrits → abonnés' },
        ].map((k, i) => (
          <div key={i} className="kpi-mini" style={{ borderLeft: `4px solid ${k.color}` }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
              <span style={{ fontSize: 20 }}>{k.icon}</span>
              <span style={{ fontSize: 10, color: '#64748b', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 600 }}>{k.label}</span>
            </div>
            <div style={{ fontSize: 22, fontWeight: 800, color: k.color, fontFamily: 'monospace' }}>{k.val}</div>
            <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 4 }}>{k.sub}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
