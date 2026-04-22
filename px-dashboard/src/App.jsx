import React, { useState } from 'react';
import { useSheetData } from './useSheetData.js';
import { StatusPill } from './components/StatusPill.jsx';
import { SummaryView } from './views/SummaryView.jsx';
import { UnitGridView } from './views/UnitGridView.jsx';
import { UnitDetailView } from './views/UnitDetailView.jsx';
import { DomainView } from './views/DomainView.jsx';

const NAV = [
  { id: 'summary', label: 'Summary'     },
  { id: 'units',   label: 'Unit Cards'  },
  { id: 'domains', label: 'Domain Drill'},
];

function Spinner() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '60vh', gap: 16 }}>
      <div style={{
        width: 36, height: 36, border: '3px solid #e2e8f0',
        borderTop: '3px solid #0f172a', borderRadius: '50%',
        animation: 'spin 0.8s linear infinite',
      }} />
      <div style={{ fontSize: 11, fontFamily: "'DM Mono', monospace", color: '#94a3b8', letterSpacing: '0.08em' }}>
        LOADING SHEET DATA...
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

function ErrorState({ error, onRetry }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '60vh', gap: 16, padding: 32, textAlign: 'center' }}>
      <div style={{ fontSize: 32 }}>⚠</div>
      <div style={{ fontSize: 16, fontWeight: 700, color: '#0f172a', fontFamily: "'Playfair Display', Georgia, serif" }}>Could not load sheet data</div>
      <div style={{ fontSize: 12, color: '#64748b', fontFamily: "'DM Mono', monospace", maxWidth: 480, lineHeight: 1.6 }}>
        {error}<br /><br />
        Make sure your Google Sheet is set to <strong>"Anyone with the link → Viewer"</strong> and the tab gid values in useSheetData.js are correct.
      </div>
      <button onClick={onRetry} style={{
        background: '#0f172a', color: '#fff', border: 'none', borderRadius: 8,
        padding: '10px 20px', cursor: 'pointer', fontSize: 11,
        fontFamily: "'DM Mono', monospace", letterSpacing: '0.06em',
      }}>RETRY</button>
    </div>
  );
}

export default function App() {
  const { data, loading, error, lastRefresh, refresh } = useSheetData();
  const [view,         setView]         = useState('summary');
  const [selectedUnit, setSelectedUnit] = useState(null);

  const now     = new Date();
  const dateStr = now.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }).toUpperCase();
  const timeStr = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

  function handleSelectUnit(unit) {
    setSelectedUnit(unit);
    setView('units');
  }
  function handleBack() {
    setSelectedUnit(null);
  }
  function handleNav(id) {
    setView(id);
    setSelectedUnit(null);
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f1f5f9', fontFamily: "'DM Sans', system-ui, sans-serif" }}>

      {/* ── Top bar ── */}
      <div style={{
        background: '#0f172a', height: 40,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 24px', position: 'sticky', top: 0, zIndex: 100,
        borderBottom: '1px solid #1e293b',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 11, fontFamily: "'DM Mono', monospace", color: '#475569', letterSpacing: '0.08em' }}>PX OS</span>
          <span style={{ color: '#334155' }}>//</span>
          <span style={{ fontSize: 11, fontFamily: "'DM Mono', monospace", color: '#94a3b8', letterSpacing: '0.06em' }}>FY26 TARGET TRACKER</span>
          <span style={{ color: '#334155' }}>//</span>
          <span style={{ fontSize: 11, fontFamily: "'DM Mono', monospace", color: '#64748b', letterSpacing: '0.06em' }}>CEDARS-SINAI · INPATIENT HCAHPS</span>
        </div>
        <div style={{ display: 'flex', gap: 24, alignItems: 'center' }}>
          {NAV.map(({ id, label }) => (
            <button key={id} onClick={() => handleNav(id)} style={{
              background: 'none', border: 'none', cursor: 'pointer', padding: '0 0 2px',
              fontSize: 11, fontFamily: "'DM Mono', monospace", letterSpacing: '0.06em',
              color: view === id ? '#f8fafc' : '#64748b',
              borderBottom: view === id ? '1px solid #e2e8f0' : '1px solid transparent',
              transition: 'color 0.15s',
            }}>{label}</button>
          ))}
          <button onClick={refresh} style={{
            background: 'none', border: '1px solid #334155', borderRadius: 6,
            color: '#64748b', cursor: 'pointer', padding: '2px 10px',
            fontSize: 10, fontFamily: "'DM Mono', monospace", letterSpacing: '0.06em',
          }}>↻ REFRESH</button>
          <span style={{ fontSize: 10, fontFamily: "'DM Mono', monospace", color: '#475569' }}>{dateStr} · {timeStr}</span>
        </div>
      </div>

      {/* ── Main layout ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '220px 1fr', minHeight: 'calc(100vh - 40px)' }}>

        {/* ── Sidebar ── */}
        <div style={{
          background: '#fff', borderRight: '1px solid #e2e8f0',
          padding: '20px 0', position: 'sticky', top: 40,
          height: 'calc(100vh - 40px)', overflowY: 'auto',
        }}>
          {/* Operator card */}
          <div style={{ padding: '0 16px 16px', borderBottom: '1px solid #f1f5f9' }}>
            <div style={{ fontSize: 10, fontFamily: "'DM Mono', monospace", color: '#94a3b8', letterSpacing: '0.08em', marginBottom: 4 }}>01 // OPERATOR</div>
            <div style={{ fontSize: 15, fontWeight: 700, color: '#0f172a', fontFamily: "'Playfair Display', Georgia, serif" }}>
              Patient <span style={{ fontStyle: 'italic' }}>Experience</span>
            </div>
            <div style={{ fontSize: 11, color: '#64748b', marginTop: 2, fontFamily: "'DM Mono', monospace" }}>CEDARS-SINAI · INPATIENT</div>
            <div style={{ marginTop: 10, display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              <span style={{ fontSize: 10, fontFamily: "'DM Mono', monospace", background: '#f1f5f9', color: '#475569', padding: '3px 8px', borderRadius: 99 }}>FY2026</span>
              <span style={{ fontSize: 10, fontFamily: "'DM Mono', monospace", background: '#dcfce7', color: '#166534', padding: '3px 8px', borderRadius: 99 }}>● LIVE</span>
            </div>
            {lastRefresh && (
              <div style={{ fontSize: 9, fontFamily: "'DM Mono', monospace", color: '#cbd5e1', marginTop: 8 }}>
                LAST REFRESH {lastRefresh.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
              </div>
            )}
          </div>

          {/* Unit list */}
          {data && (
            <div style={{ padding: '12px 16px 6px' }}>
              <div style={{ fontSize: 10, fontFamily: "'DM Mono', monospace", color: '#94a3b8', letterSpacing: '0.08em', marginBottom: 8 }}>TARGET UNITS</div>
              {data.units.map(u => {
                const focusCount = u.domains.filter(d => d.status === 'Focus Area').length;
                const isSelected = selectedUnit?.id === u.id;
                return (
                  <button key={u.id} onClick={() => handleSelectUnit(u)} style={{
                    width: '100%', background: isSelected ? '#f8fafc' : 'none',
                    border: 'none', borderRadius: 8, padding: '8px 10px',
                    cursor: 'pointer', display: 'flex', alignItems: 'center',
                    justifyContent: 'space-between', marginBottom: 2,
                    borderLeft: `2px solid ${isSelected ? '#0f172a' : 'transparent'}`,
                    transition: 'background 0.1s',
                  }}>
                    <div style={{ textAlign: 'left' }}>
                      <div style={{ fontSize: 12, fontWeight: 700, color: '#0f172a', fontFamily: "'Playfair Display', Georgia, serif" }}>{u.label}</div>
                      <div style={{ fontSize: 10, color: '#94a3b8', fontFamily: "'DM Mono', monospace" }}>{u.division}</div>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 3 }}>
                      <StatusPill status={u.status} small />
                      {focusCount > 0 && (
                        <span style={{ fontSize: 9, fontFamily: "'DM Mono', monospace", color: '#dc2626', background: '#fef2f2', padding: '1px 6px', borderRadius: 99 }}>
                          {focusCount} focus
                        </span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          )}

          {/* Data source footer */}
          <div style={{ padding: '16px', marginTop: 8, borderTop: '1px solid #f1f5f9' }}>
            <div style={{ fontSize: 9, fontFamily: "'DM Mono', monospace", color: '#cbd5e1', lineHeight: 1.8 }}>
              SOURCE: GOOGLE SHEETS<br />
              HCAHPS TOP BOX %<br />
              PRESS GANEY · FY26
            </div>
          </div>
        </div>

        {/* ── Content area ── */}
        <div style={{ padding: 24, overflowY: 'auto' }}>

          {/* Hero banner (only when not in unit detail) */}
          {!selectedUnit && (
            <div style={{
              background: '#0f172a', borderRadius: 14, padding: '28px 32px', marginBottom: 24,
              position: 'relative', overflow: 'hidden',
            }}>
              <div style={{
                position: 'absolute', top: -60, right: -60, width: 240, height: 240,
                borderRadius: '50%', border: '1px solid rgba(255,255,255,0.04)',
                background: 'radial-gradient(circle, rgba(99,102,241,0.08) 0%, transparent 70%)',
              }} />
              <div style={{ fontSize: 10, fontFamily: "'DM Mono', monospace", color: '#475569', letterSpacing: '0.1em', marginBottom: 8 }}>
                FY26 · INPATIENT HCAHPS · {data ? `${data.units.length} ACTIVE TARGET UNITS` : 'LOADING...'}
              </div>
              <div style={{ fontSize: 32, fontWeight: 800, color: '#f8fafc', fontFamily: "'Playfair Display', Georgia, serif", lineHeight: 1.2, marginBottom: 6 }}>
                Target Unit <span style={{ fontStyle: 'italic', color: '#94a3b8' }}>Performance</span>
              </div>
              <div style={{ fontSize: 13, color: '#64748b', fontFamily: "'DM Mono', monospace" }}>
                Baseline Jul 2025 → Current Apr 2026  ·  Division bottom-quartile threshold analysis
              </div>
            </div>
          )}

          {/* Content */}
          {loading && <Spinner />}
          {error   && <ErrorState error={error} onRetry={refresh} />}
          {data && !loading && (
            <>
              {selectedUnit
                ? <UnitDetailView unit={selectedUnit} onBack={handleBack} />
                : view === 'summary' ? <SummaryView data={data} />
                : view === 'units'   ? <UnitGridView units={data.units} onSelect={handleSelectUnit} />
                : view === 'domains' ? <DomainView   units={data.units} />
                : null
              }
            </>
          )}
        </div>
      </div>
    </div>
  );
}
