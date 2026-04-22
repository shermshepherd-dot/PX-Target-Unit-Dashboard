import React from 'react';
import { StatusPill, STATUS_META } from '../components/StatusPill.jsx';

export function UnitGridView({ units, onSelect }) {
  return (
    <div>
      <div style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 10, fontFamily: "'DM Mono', monospace", color: '#94a3b8', letterSpacing: '0.1em', textTransform: 'uppercase' }}>04 // UNIT CARDS</div>
        <div style={{ fontSize: 22, fontWeight: 800, color: '#0f172a', marginTop: 4, fontFamily: "'Playfair Display', Georgia, serif" }}>
          Target Unit <span style={{ fontStyle: 'italic', fontWeight: 400 }}>Overview</span>
        </div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 14 }}>
        {units.map(u => {
          const focusDomains  = u.domains.filter(d => d.status === 'Focus Area');
          const validDomains  = u.domains.filter(d => d.current != null);
          const avgCurrent    = validDomains.length ? (validDomains.reduce((a,d) => a + d.current, 0) / validDomains.length).toFixed(1) : '—';

          return (
            <button key={u.id} onClick={() => onSelect(u)} style={{
              background: '#fff', borderRadius: 12, padding: 18, textAlign: 'left',
              border: 'none', cursor: 'pointer',
              boxShadow: '0 1px 3px rgba(0,0,0,0.06), 0 0 0 1px rgba(0,0,0,0.04)',
              transition: 'box-shadow 0.15s, transform 0.1s',
            }}
            onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.1), 0 0 0 1px rgba(0,0,0,0.06)'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
            onMouseLeave={e => { e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.06), 0 0 0 1px rgba(0,0,0,0.04)'; e.currentTarget.style.transform = 'none'; }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                <div>
                  <div style={{ fontSize: 10, fontFamily: "'DM Mono', monospace", color: '#94a3b8', marginBottom: 3 }}>
                    {u.division}{u.n ? ` · n=${u.n}` : ''}
                  </div>
                  <div style={{ fontSize: 18, fontWeight: 800, color: '#0f172a', fontFamily: "'Playfair Display', Georgia, serif" }}>{u.label}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: 28, fontWeight: 800, color: '#0f172a', fontFamily: "'Playfair Display', Georgia, serif", lineHeight: 1 }}>{avgCurrent}</div>
                  <div style={{ fontSize: 9, color: '#94a3b8', fontFamily: "'DM Mono', monospace" }}>AVG SCORE</div>
                </div>
              </div>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 14 }}>
                <StatusPill status={u.status} small />
                {focusDomains.length > 0 && (
                  <span style={{ fontSize: 10, background: '#fef2f2', color: '#991b1b', padding: '2px 8px', borderRadius: 99, fontFamily: "'DM Mono', monospace", fontWeight: 600 }}>
                    {focusDomains.length} focus area{focusDomains.length > 1 ? 's' : ''}
                  </span>
                )}
              </div>
              {/* Mini domain bars */}
              <div style={{ display: 'flex', gap: 4, alignItems: 'flex-end' }}>
                {u.domains.map(d => {
                  const m   = STATUS_META[d.status] || STATUS_META['Watchlist'];
                  const h   = d.current ? Math.max((d.current / 100) * 36, 4) : 4;
                  return (
                    <div key={d.name} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3 }}>
                      <div style={{ width: '100%', height: 36, background: '#f8fafc', borderRadius: 4, overflow: 'hidden', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', position: 'relative' }}>
                        {d.threshold && (
                          <div style={{ position: 'absolute', bottom: `${(d.threshold / 100) * 36}px`, left: 0, right: 0, height: 1, background: '#e2e8f0' }} />
                        )}
                        <div style={{ width: '100%', height: h, background: m.dot, opacity: 0.7, borderRadius: '2px 2px 0 0' }} />
                      </div>
                      <div style={{ fontSize: 8, fontFamily: "'DM Mono', monospace", color: '#94a3b8', textAlign: 'center' }}>
                        {d.current?.toFixed(0) ?? '—'}
                      </div>
                    </div>
                  );
                })}
              </div>
              <div style={{ display: 'flex', marginTop: 6, gap: 8 }}>
                {u.domains.map(d => (
                  <div key={d.name} style={{ flex: 1, fontSize: 7, fontFamily: "'DM Mono', monospace", color: '#cbd5e1', textAlign: 'center', lineHeight: 1.2 }}>
                    {d.name.replace(' Comm','').replace(' Info','').replace(' Coord','').replace(' Response','')}
                  </div>
                ))}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
