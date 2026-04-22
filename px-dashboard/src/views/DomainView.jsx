import React from 'react';
import { StatusPill, STATUS_META } from '../components/StatusPill.jsx';

const DOMAIN_NAMES = ['Nurse Comm','Meds Comm','Discharge Info','Care Coord','Staff Response'];

export function DomainView({ units }) {
  return (
    <div>
      <div style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 10, fontFamily: "'DM Mono', monospace", color: '#94a3b8', letterSpacing: '0.1em', textTransform: 'uppercase' }}>05 // DOMAIN DRILL</div>
        <div style={{ fontSize: 22, fontWeight: 800, color: '#0f172a', marginTop: 4, fontFamily: "'Playfair Display', Georgia, serif" }}>
          Baseline <span style={{ fontStyle: 'italic', fontWeight: 400 }}>vs.</span> Current — All Domains
        </div>
      </div>

      {DOMAIN_NAMES.map(domain => {
        const domainUnits = units.map(u => ({
          ...u,
          domain: u.domains.find(d => d.name === domain),
        })).filter(u => u.domain && u.domain.current != null);

        const avgCurrent   = (domainUnits.reduce((a,u) => a + u.domain.current, 0) / domainUnits.length).toFixed(1);
        const baselineArr  = domainUnits.filter(u => u.domain.baseline != null);
        const avgBaseline  = baselineArr.length ? (baselineArr.reduce((a,u) => a + u.domain.baseline, 0) / baselineArr.length).toFixed(1) : null;
        const focusCount   = domainUnits.filter(u => u.domain.status === 'Focus Area').length;
        const netChange    = avgBaseline ? (parseFloat(avgCurrent) - parseFloat(avgBaseline)).toFixed(1) : null;

        return (
          <div key={domain} style={{
            background: '#fff', borderRadius: 12, marginBottom: 16,
            boxShadow: '0 1px 3px rgba(0,0,0,0.06), 0 0 0 1px rgba(0,0,0,0.04)',
            overflow: 'hidden',
          }}>
            <div style={{
              padding: '14px 20px', borderBottom: '1px solid #f1f5f9',
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              background: focusCount >= 3 ? '#fff7ed' : '#fff',
            }}>
              <div>
                <div style={{ fontSize: 15, fontWeight: 700, color: '#0f172a', fontFamily: "'Playfair Display', Georgia, serif" }}>{domain}</div>
                <div style={{ fontSize: 10, color: '#94a3b8', fontFamily: "'DM Mono', monospace", marginTop: 2 }}>
                  {avgBaseline ? `avg baseline ${avgBaseline} → ` : ''}current {avgCurrent} · {focusCount} unit{focusCount !== 1 ? 's' : ''} in focus area
                </div>
              </div>
              <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
                {netChange && (
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: 10, fontFamily: "'DM Mono', monospace", color: '#94a3b8' }}>CHANGE</div>
                    <div style={{ fontSize: 18, fontWeight: 800, fontFamily: "'Playfair Display', Georgia, serif",
                      color: parseFloat(netChange) >= 0 ? '#16a34a' : '#dc2626' }}>
                      {netChange > 0 ? '+' : ''}{netChange}
                    </div>
                  </div>
                )}
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: 10, fontFamily: "'DM Mono', monospace", color: '#94a3b8' }}>AVG</div>
                  <div style={{ fontSize: 22, fontWeight: 800, fontFamily: "'Playfair Display', Georgia, serif", color: '#0f172a' }}>{avgCurrent}</div>
                </div>
              </div>
            </div>

            <div style={{ padding: '4px 20px 12px' }}>
              {domainUnits.map((u, i) => {
                const d       = u.domain;
                const m       = STATUS_META[d.status] || STATUS_META['Watchlist'];
                const barW    = Math.min((d.current / 100) * 100, 100);
                const baseW   = d.baseline ? Math.min((d.baseline / 100) * 100, 100) : null;
                const change  = d.baseline ? (d.current - d.baseline).toFixed(1) : null;
                return (
                  <div key={u.id} style={{
                    display: 'grid', gridTemplateColumns: '160px 1fr 60px 60px 55px',
                    alignItems: 'center', gap: 12, padding: '9px 0',
                    borderBottom: i < domainUnits.length - 1 ? '1px solid #f8fafc' : 'none',
                  }}>
                    <div>
                      <div style={{ fontSize: 12, fontWeight: 600, color: '#0f172a', marginBottom: 3 }}>{u.label}</div>
                      <StatusPill status={d.status} small />
                    </div>
                    <div style={{ position: 'relative', height: 10 }}>
                      <div style={{ position: 'absolute', inset: '3px 0', background: '#f1f5f9', borderRadius: 99 }} />
                      {baseW && (
                        <div style={{ position: 'absolute', top: '3px', bottom: '3px', left: 0, width: `${baseW}%`, background: '#e2e8f0', borderRadius: 99 }} />
                      )}
                      <div style={{ position: 'absolute', top: 0, bottom: 0, left: 0, width: `${barW}%`, background: m.dot, borderRadius: 99, opacity: 0.8 }} />
                      {d.threshold && (
                        <div style={{ position: 'absolute', left: `${d.threshold}%`, top: -2, bottom: -2, width: 2, background: '#64748b', borderRadius: 1 }} />
                      )}
                    </div>
                    <span style={{ fontSize: 11, color: '#94a3b8', textAlign: 'center', fontFamily: "'DM Mono', monospace" }}>{d.baseline?.toFixed(0) ?? '—'}</span>
                    <span style={{ fontSize: 14, fontWeight: 700, color: '#0f172a', textAlign: 'center', fontFamily: "'Playfair Display', Georgia, serif" }}>{d.current.toFixed(1)}</span>
                    <span style={{ fontSize: 11, fontWeight: 700, textAlign: 'right', fontFamily: "'DM Mono', monospace",
                      color: change == null ? '#94a3b8' : parseFloat(change) >= 0 ? '#16a34a' : '#dc2626' }}>
                      {change ? (change > 0 ? '+' : '') + change : '—'}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
