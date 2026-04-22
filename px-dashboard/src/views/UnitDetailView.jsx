import React from 'react';
import { StatusPill, STATUS_META } from '../components/StatusPill.jsx';

function GapBar({ gap }) {
  if (gap == null) return null;
  const pct    = Math.min(Math.abs(gap) / 15 * 100, 100);
  const isAbove = gap >= 0;
  const color   = isAbove ? (gap > 3 ? '#22c55e' : '#f59e0b') : '#ef4444';
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
      <div style={{ flex: 1, height: 4, background: '#e2e8f0', borderRadius: 99, position: 'relative', overflow: 'hidden' }}>
        <div style={{
          position: 'absolute', height: '100%', width: `${pct}%`,
          background: color, borderRadius: 99,
          left: isAbove ? '50%' : `calc(50% - ${pct}%)`,
        }} />
        <div style={{ position: 'absolute', left: '50%', top: 0, bottom: 0, width: 1, background: '#94a3b8' }} />
      </div>
      <span style={{ fontSize: 11, fontFamily: "'DM Mono', monospace", color, minWidth: 42, textAlign: 'right', fontWeight: 700 }}>
        {gap > 0 ? '+' : ''}{gap.toFixed(1)}
      </span>
    </div>
  );
}

export function UnitDetailView({ unit, onBack }) {
  const validDomains  = unit.domains.filter(d => d.current != null);
  const avgCurrent    = validDomains.length ? (validDomains.reduce((a, d) => a + d.current, 0) / validDomains.length).toFixed(1) : '—';
  const baselineDoms  = validDomains.filter(d => d.baseline != null);
  const avgBaseline   = baselineDoms.length  ? (baselineDoms.reduce((a, d) => a + d.baseline, 0) / baselineDoms.length).toFixed(1) : null;
  const avgChange     = avgBaseline ? (parseFloat(avgCurrent) - parseFloat(avgBaseline)).toFixed(1) : null;
  const focusDomains  = unit.domains.filter(d => d.status === 'Focus Area');

  return (
    <div>
      {/* Back + header */}
      <div style={{ marginBottom: 20, display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
        <div>
          <button onClick={onBack} style={{
            background: 'none', border: 'none', cursor: 'pointer',
            fontSize: 11, fontFamily: "'DM Mono', monospace", color: '#94a3b8',
            letterSpacing: '0.08em', marginBottom: 8, padding: 0,
            display: 'flex', alignItems: 'center', gap: 6,
          }}>← BACK TO SUMMARY</button>
          <div style={{ fontSize: 10, fontFamily: "'DM Mono', monospace", color: '#94a3b8', letterSpacing: '0.1em' }}>
            {unit.division} DIVISION{unit.n ? ` · N=${unit.n}` : ''}
          </div>
          <h2 style={{ margin: '4px 0 8px', fontSize: 28, fontWeight: 800, color: '#0f172a', fontFamily: "'Playfair Display', Georgia, serif" }}>{unit.label}</h2>
          <StatusPill status={unit.status} />
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          {[
            { label: 'Avg Score',    val: avgCurrent, note: avgBaseline ? `was ${avgBaseline}` : 'current', color: '#0f172a' },
            avgChange ? { label: 'Net Change', val: `${avgChange > 0 ? '+' : ''}${avgChange}`, note: 'vs baseline', color: parseFloat(avgChange) >= 0 ? '#16a34a' : '#dc2626' } : null,
            { label: 'Focus Areas',  val: focusDomains.length, note: `${unit.domains.length - focusDomains.length} on track`, color: focusDomains.length > 0 ? '#dc2626' : '#16a34a' },
          ].filter(Boolean).map(({ label, val, note, color }) => (
            <div key={label} style={{
              background: '#fff', borderRadius: 10, padding: '12px 16px', minWidth: 110,
              boxShadow: '0 1px 3px rgba(0,0,0,0.06), 0 0 0 1px rgba(0,0,0,0.04)', textAlign: 'center',
            }}>
              <div style={{ fontSize: 10, fontFamily: "'DM Mono', monospace", color: '#94a3b8', marginBottom: 4 }}>{label}</div>
              <div style={{ fontSize: 22, fontWeight: 800, color, fontFamily: "'Playfair Display', Georgia, serif" }}>{val}</div>
              <div style={{ fontSize: 10, color: '#94a3b8', fontFamily: "'DM Mono', monospace" }}>{note}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Domain cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5,1fr)', gap: 12, marginBottom: 20 }}>
        {unit.domains.map(d => {
          const m       = STATUS_META[d.status] || STATUS_META['Watchlist'];
          const pctBar  = Math.min((d.current / 100) * 100, 100);
          const baseBar = d.baseline ? Math.min((d.baseline / 100) * 100, 100) : null;
          return (
            <div key={d.name} style={{
              background: '#fff', borderRadius: 12, padding: 16,
              boxShadow: '0 1px 3px rgba(0,0,0,0.06), 0 0 0 1px rgba(0,0,0,0.04)',
              borderTop: `3px solid ${m.dot}`,
            }}>
              <div style={{ fontSize: 10, fontFamily: "'DM Mono', monospace", color: '#94a3b8', letterSpacing: '0.06em', marginBottom: 8, textTransform: 'uppercase' }}>{d.name}</div>
              <div style={{ fontSize: 28, fontWeight: 800, color: '#0f172a', fontFamily: "'Playfair Display', Georgia, serif", lineHeight: 1 }}>
                {d.current?.toFixed(1) ?? '—'}
              </div>
              {d.baseline && (
                <div style={{ fontSize: 11, color: '#94a3b8', margin: '4px 0 12px', fontFamily: "'DM Mono', monospace" }}>
                  baseline <span style={{ color: '#64748b', fontWeight: 600 }}>{d.baseline.toFixed(1)}</span>
                </div>
              )}
              {/* Score bar */}
              <div style={{ marginBottom: 8 }}>
                <div style={{ height: 6, background: '#f1f5f9', borderRadius: 99, position: 'relative', overflow: 'hidden' }}>
                  {baseBar && <div style={{ position: 'absolute', height: '100%', width: `${baseBar}%`, background: '#e2e8f0', borderRadius: 99 }} />}
                  <div style={{ position: 'absolute', height: '100%', width: `${pctBar}%`, background: m.dot, borderRadius: 99, opacity: 0.85 }} />
                  {d.threshold && <div style={{ position: 'absolute', left: `${d.threshold}%`, top: -2, bottom: -2, width: 2, background: '#64748b', borderRadius: 1 }} />}
                </div>
                {d.threshold && (
                  <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 2 }}>
                    <span style={{ fontSize: 9, color: '#94a3b8', fontFamily: "'DM Mono', monospace" }}>threshold {d.threshold.toFixed(1)}</span>
                  </div>
                )}
              </div>
              <GapBar gap={d.gap} />
              <div style={{ marginTop: 10 }}><StatusPill status={d.status} small /></div>
            </div>
          );
        })}
      </div>

      {/* Detail table */}
      <div style={{ background: '#fff', borderRadius: 12, overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.06), 0 0 0 1px rgba(0,0,0,0.04)' }}>
        <div style={{ padding: '14px 20px', borderBottom: '1px solid #f1f5f9' }}>
          <div style={{ fontSize: 10, fontFamily: "'DM Mono', monospace", color: '#94a3b8', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Performance Table</div>
          <div style={{ fontSize: 14, fontWeight: 600, color: '#0f172a', marginTop: 2, fontFamily: "'Playfair Display', Georgia, serif" }}>
            Domain breakdown <span style={{ fontStyle: 'italic', fontWeight: 400 }}>vs. division threshold</span>
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 90px 100px 90px 110px 130px', padding: '8px 20px', background: '#f8fafc', borderBottom: '1px solid #f1f5f9' }}>
          {['DOMAIN','CURRENT','THRESHOLD','BASELINE','GAP','STATUS'].map(h => (
            <span key={h} style={{ fontSize: 10, fontFamily: "'DM Mono', monospace", color: '#94a3b8', letterSpacing: '0.06em' }}>{h}</span>
          ))}
        </div>
        {unit.domains.map((d, i) => {
          const gapColor = !d.gap ? '#94a3b8' : d.gap > 3 ? '#16a34a' : d.gap < 0 ? '#dc2626' : '#d97706';
          return (
            <div key={d.name} style={{
              display: 'grid', gridTemplateColumns: '1fr 90px 100px 90px 110px 130px',
              padding: '12px 20px', alignItems: 'center',
              borderBottom: i < unit.domains.length - 1 ? '1px solid #f8fafc' : 'none',
              background: i % 2 === 0 ? '#fff' : '#fafbfc',
            }}>
              <span style={{ fontSize: 13, fontWeight: 600, color: '#0f172a' }}>{d.name}</span>
              <span style={{ fontSize: 14, fontWeight: 700, fontFamily: "'Playfair Display', Georgia, serif", color: '#0f172a' }}>{d.current?.toFixed(1) ?? '—'}</span>
              <span style={{ fontSize: 13, color: '#94a3b8' }}>{d.threshold?.toFixed(1) ?? '—'}</span>
              <span style={{ fontSize: 13, color: '#64748b' }}>{d.baseline?.toFixed(1) ?? '—'}</span>
              <span style={{ fontSize: 13, fontWeight: 700, color: gapColor, fontFamily: "'DM Mono', monospace" }}>
                {d.gap != null ? (d.gap > 0 ? '+' : '') + d.gap.toFixed(1) : '—'}
              </span>
              <StatusPill status={d.status} small />
            </div>
          );
        })}
      </div>
    </div>
  );
}
