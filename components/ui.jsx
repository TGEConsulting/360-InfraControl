'use client';
import React from 'react';

export const mix = (pct) => `color-mix(in srgb,var(--color-text) ${pct}%,transparent)`;

export const Corners = () => (<><i className="corner tl" /><i className="corner tr" /><i className="corner bl" /><i className="corner br" /></>);

export const Card = ({ children, style, className = '', ...rest }) => (
  <div className={`card blueprint ${className}`} style={style} {...rest}><Corners />{children}</div>
);

export const Kicker = ({ children, style }) => <div className="card-kicker" style={style}>{children}</div>;

export const Icon = ({ d, size = 15, sw = 1.6, style }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={sw} style={style} aria-hidden="true"><path d={d} /></svg>
);

export const PageHead = ({ title, sub, children }) => (
  <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 16, marginBottom: 16, flexWrap: 'wrap' }}>
    <div>
      <h2 style={{ margin: 0 }}>{title}</h2>
      {sub && <p style={{ margin: '4px 0 0', fontSize: 13, color: mix(60) }}>{sub}</p>}
    </div>
    {children}
  </div>
);

export const BarRow = ({ cols, name, pct, color = 'var(--color-accent)', value, h = 16, dot }) => (
  <div style={{ display: 'grid', gridTemplateColumns: cols, alignItems: 'center', gap: 10, fontSize: 12.5 }}>
    <span style={{ display: 'flex', alignItems: 'center', gap: 8, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', color: dot ? undefined : mix(78) }}>
      {dot && <span style={{ width: 9, height: 9, borderRadius: '50%', background: dot, flex: 'none' }} />}{name}
    </span>
    <div style={{ height: h, background: mix(7) }}><div style={{ height: '100%', width: pct, background: color }} /></div>
    <strong style={{ textAlign: 'right' }}>{value}</strong>
  </div>
);

export const Timeline = ({ items }) => (
  <div style={{ display: 'flex', flexDirection: 'column' }}>
    {items.map((e, i) => (
      <div key={i} style={{ display: 'grid', gridTemplateColumns: '14px 1fr', gap: 12 }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <span style={{ width: 11, height: 11, borderRadius: '50%', background: e.color, border: '2px solid var(--color-bg)', boxShadow: `0 0 0 1px ${e.color}` }} />
          <span style={{ flex: 1, width: 1, background: 'var(--color-divider)', minHeight: 12 }} />
        </div>
        <div style={{ paddingBottom: 16 }}>
          <div style={{ fontSize: 13, fontFamily: 'var(--font-heading)', fontWeight: 600 }}>{e.action}</div>
          <div style={{ fontSize: 12, color: mix(70), marginTop: 2 }}>{e.note}</div>
          <div style={{ fontSize: 10.5, color: mix(48), marginTop: 3 }}>{e.time} · {e.user}</div>
        </div>
      </div>
    ))}
  </div>
);

export const prioStyle = (p) => {
  const c = p === 'Alta' ? 'err' : p === 'Baja' ? 'ok' : 'warn';
  return { background: `var(--${c}-bg)`, color: `var(--${c})`, border: `1px solid color-mix(in srgb,var(--${c}) 35%,transparent)` };
};

export const statusStyle = (s) => {
  if (s === 'Cerrado') return { background: 'var(--ok-bg)', color: 'var(--ok)', border: '1px solid color-mix(in srgb,var(--ok) 30%,transparent)' };
  if (s === 'En proceso') return { background: 'var(--color-accent-100)', color: 'var(--color-accent-800)', border: '1px solid color-mix(in srgb,var(--color-accent) 30%,transparent)' };
  if (s === 'Pendiente verificación') return { background: 'var(--warn-bg)', color: 'var(--warn)', border: '1px solid color-mix(in srgb,var(--warn) 30%,transparent)' };
  return { background: 'var(--color-neutral-100)', color: 'var(--color-neutral-800)', border: '1px solid var(--color-divider)' };
};
