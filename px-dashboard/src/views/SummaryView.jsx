import React from 'react';
import { StatusPill } from '../components/StatusPill.jsx';

export function SummaryView({ data }) {
  const { houseWide, units } = data;

  const focusCount   = units.reduce((a, u) => a + u.domains.filter(d => d.status === 'Focus Area').length, 0);
  const watchCount   = units.reduce((a, u) => a + u.domains.filter(d => d.status === 'Watchlist').length, 0);
  const improved     = houseWide.filter(r => r.status === 'IMPROVED').length;
  const continued    = houseWide.filter(r => r.status === 'CONTINUED TARGET').length;
  const newTargets   = houseWide.filter(r => r.status === 'NEW TARGET').length;

  const kpis = [
    { label: 'Total Units',       val: houseWide.length, color: '#1e293b', sub: 'FY26 portfolio' },
    { label: 'Continued Targets', val: continued,        color: '#d97706', sub: 'Active priority' },
    { label: 'Improved',          val: improved,         color: '#16a34a', sub: 'Exited target' },
    { label: 'New Targets',       val: newTargets,       color: '#2563eb', sub: 'FY26 additions' },
    { label: 'Focus Domains',     val: focusCount,       color: '#dc2626', sub: 'Below threshold' },
    { label: 'Watchlist Domains', val: watchCount,       color: '#d97706', sub: 'At-risk' },
  ];

  return (
    <div>
      {/* KPI strip */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6,1fr)', gap: 12, marginBottom: 24 }}>
        {kpis.map(({ label, val, color, sub }) => (
          <div key={label} style={{
            background: '#fff', borderRadius: 12, padding: '16px 18px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.06), 0 0 0 1px rgba(0,0,0,0.04)',
          }}>
            <div style={{ fontSize: 11, fontFamily: "'DM Mono', monospace", color: '#94a3b8', letterSpacing: '0.08em', marginBottom: 6, textTransform: 'uppercase' }}>{label}</div>
            <div style={{ fontSize: 32, fontWeight: 800, color, lineHeight: 1, fontFamily: "'Playfair Display', Georgia, serif" }}>{val}</div>
            <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 4, fontFamily: "'DM Mono', monospace" }}>{sub}</div>
          </div>
        ))}
      </div>

      {/* House wide table */}
      <div style={{ background: '#fff', borderRadius: 12, boxShadow: '0 1px 3px rgba(0,0,0,0.06), 0 0 0 1px rgba(0,0,0,0.04)', overflow: 'hidden', marginBottom: 24 }}>
        <div style={{ padding: '14px 20px', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontSize: 10, fontFamily: "'DM Mono', monospace", color: '#94a3b8', letterSpacing: '0.1em', textTransform: 'uppercase' }}>02 // HOUSE WIDE SUMMARY</div>
            <div style={{ fontSize: 16, fontWeight: 700, color: '#0f172a', marginTop: 2, fontFamily: "'Playfair Display', Georgia, serif" }}>
              All Target Units <span style={{ fontStyle: 'italic', fontWeight: 400 }}>— FY2026</span>
            </div>
          </div>
          <div style={{ fontSize: 10, fontFamily: "'DM Mono', monospace", color: '#94a3b8' }}>{houseWide.length} UNITS TRACKED</div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '130px 1fr 150px 1fr', padding: '8px 20px', background: '#f8fafc', borderBottom: '1px solid #f1f5f9' }}>
          {['DIVISION','UNIT','STATUS','FAILING DOMAINS'].map(h => (
            <span key={h} style={{ fontSize: 10, fontFamily: "'DM Mono', monospace", color: '#94a3b8', letterSpacing: '0.06em' }}>{h}</span>
          ))}
        </div>
        {houseWide.map((row, i) => (
          <div key={i} style={{
            display: 'grid', gridTemplateColumns: '130px 1fr 150px 1fr',
            padding: '11px 20px', alignItems: 'center',
            borderBottom: i < houseWide.length - 1 ? '1px solid #f8fafc' : 'none',
            background: i % 2 === 0 ? '#fff' : '#fafbfc',
          }}>
            <span style={{ fontSize: 11, color: '#64748b', fontFamily: "'DM Mono', monospace" }}>{row.division}</span>
            <span style={{ fontSize: 13, fontWeight: 700, color: '#0f172a', fontFamily: "'Playfair Display', Georgia, serif" }}>{row.unit}</span>
            <StatusPill status={row.status} small />
            <span style={{ fontSize: 11, color: row.failing === '—' || row.failing === '-' ? '#94a3b8' : '#64748b', fontStyle: row.failing === '—' ? 'italic' : 'normal' }}>
              {row.failing === '-' ? '—' : row.failing}
            </span>
          </div>
        ))}
      </div>

      {/* Domain heatmap */}
      <div style={{ background: '#fff', borderRadius: 12, padding: 20, boxShadow: '0 1px 3px rgba(0,0,0,0.06), 0 0 0 1px rgba(0,0,0,0.04)' }}>
        <div style={{ marginBottom: 16 }}>
          <div style={{ fontSize: 10, fontFamily: "'DM Mono', monospace", color: '#94a3b8', letterSpacing: '0.1em', textTransform: 'uppercase' }}>03 // DOMAIN HEAT MAP</div>
          <div style={{ fontSize: 16, fontWeight: 700, color: '#0f172a', marginTop: 2, fontFamily: "'Playfair Display', Georgia, serif" }}>
            Current Scores <span style={{ fontStyle: 'italic', fontWeight: 400 }}>by Unit & Domain</span>
          </div>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 640 }}>
            <thead>
              <tr>
                <th style={{ textAlign: 'left', padding: '6px 12px', fontSize: 10, fontFamily: "'DM Mono', monospace", color: '#94a3b8', fontWeight: 400, background: '#f8fafc' }}>UNIT</th>
                {['NURSE COMM','MEDS COMM','DISCHARGE INFO','CARE COORD','STAFF RESPONSE'].map(d => (
                  <th key={d} style={{ padding: '6px 8px', fontSize: 9, fontFamily: "'DM Mono', monospace", color: '#94a3b8', fontWeight: 400, textAlign: 'center', background: '#f8fafc' }}>{d}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {units.map((u, ui) => (
                <tr key={u.id} style={{ borderTop: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '9px 12px' }}>
                    <div style={{ fontSize: 12, fontWeight: 700, color: '#0f172a', fontFamily: "'Playfair Display', Georgia, serif" }}>{u.label}</div>
                    <div style={{ fontSize: 10, color: '#94a3b8', fontFamily: "'DM Mono', monospace" }}>{u.division}{u.n ? ` · n=${u.n}` : ''}</div>
                  </td>
                  {u.domains.map(d => {
                    const bg  = d.status === 'Focus Area'  ? '#fef2f2'
                              : d.status === 'Watchlist'   ? '#fffbeb'
                              : '#f0fdf4';
                    const clr = d.status === 'Focus Area'  ? '#991b1b'
                              : d.status === 'Watchlist'   ? '#92400e'
                              : '#166534';
                    return (
                      <td key={d.name} style={{ padding: '7px 8px', textAlign: 'center', background: bg }}>
                        <div style={{ fontSize: 14, fontWeight: 700, color: clr, fontFamily: "'Playfair Display', Georgia, serif" }}>{d.current?.toFixed(1) ?? '—'}</div>
                        <div style={{ fontSize: 9, color: clr, opacity: 0.7, fontFamily: "'DM Mono', monospace", marginTop: 1 }}>
                          {d.gap != null ? (d.gap > 0 ? '+' : '') + d.gap.toFixed(1) : ''}
                        </div>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
