import React from 'react';

export const STATUS_META = {
  'Focus Area':        { bg: '#fde8e8', text: '#b91c1c', dot: '#ef4444' },
  'Watchlist':         { bg: '#fef3c7', text: '#92400e', dot: '#f59e0b' },
  'On Track':          { bg: '#dcfce7', text: '#166534', dot: '#22c55e' },
  'Top Performing':    { bg: '#dcfce7', text: '#166534', dot: '#22c55e' },
  'CONTINUED TARGET':  { bg: '#fef3c7', text: '#92400e', dot: '#f59e0b' },
  'IMPROVED':          { bg: '#dcfce7', text: '#166534', dot: '#22c55e' },
  'NEW TARGET':        { bg: '#dbeafe', text: '#1e40af', dot: '#3b82f6' },
};

export function StatusPill({ status, small }) {
  const m   = STATUS_META[status] || { bg: '#f1f5f9', text: '#64748b', dot: '#94a3b8' };
  const lbl = status === 'CONTINUED TARGET' ? 'Continued'
            : status === 'NEW TARGET'        ? 'New Target'
            : status === 'IMPROVED'          ? 'Improved'
            : status;
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 5,
      background: m.bg, color: m.text,
      padding: small ? '2px 8px' : '3px 10px',
      borderRadius: 99,
      fontSize: small ? 10 : 11,
      fontFamily: "'DM Mono', monospace",
      fontWeight: 600,
      letterSpacing: '0.03em',
      whiteSpace: 'nowrap',
    }}>
      <span style={{ width: small ? 5 : 6, height: small ? 5 : 6, borderRadius: '50%', background: m.dot, flexShrink: 0 }} />
      {lbl}
    </span>
  );
}
