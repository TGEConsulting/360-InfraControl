'use client';
import React from 'react';
import { Card, Kicker, Icon, PageHead, BarRow, Timeline, mix, prioStyle, statusStyle } from './ui';

const hv = 'btn btn-secondary';
const pct = (n, t) => (t ? Math.round((n / t) * 100) : 0);
const countBy = (R, f) => { const o = {}; R.forEach((x) => { const k = f(x); o[k] = (o[k] || 0) + 1; }); return Object.entries(o).sort((a, b) => b[1] - a[1]); };

// ───────── Dashboard
export function Dashboard({ R, go }) {
  const total = R.length, cerrados = R.filter((x) => x.estatus === 'Cerrado').length, abiertos = total - cerrados;
  const crit = R.filter((x) => x.prio === 'Alta').length;
  const n = (s) => R.filter((x) => x.estatus === s).length;
  const cumpl = pct(cerrados, total);
  const areas = countBy(R, (x) => x.area);
  const kpis = [
    ['Hallazgos registrados', total, 'Plan 2026 · PR-MAN-21'], ['Hallazgos abiertos', abiertos, 'No cerrados'],
    ['Hallazgos críticos', crit, 'Prioridad Alta'], ['Cerrados', cerrados, 'Liberados por SGI'],
    ['Cumplimiento', cumpl + '%', `${cerrados} / ${total} cerrados`], ['En proceso', n('En proceso'), 'Ejecución activa'],
    ['Pendiente verificación', n('Pendiente verificación'), 'Por liberar'], ['Áreas con hallazgo', areas.length, 'de 9 áreas de planta'],
  ];
  const est = [['Abierto', 'var(--color-neutral-500)'], ['En proceso', 'var(--color-accent)'], ['Pendiente verificación', 'var(--warn)'], ['Cerrado', 'var(--ok)']];
  const abP = (p) => R.filter((x) => x.estatus !== 'Cerrado' && x.prio === p).length;
  const sla = [['Prioridad Alta', 'Alta', 'var(--err)'], ['Prioridad Media', 'Media', 'var(--warn)'], ['Prioridad Baja', 'Baja', 'var(--ok)']];
  const amax = Math.max(1, ...areas.map((a) => a[1]));
  const elem = countBy(R, (x) => x.categoria).slice(0, 5), emax = Math.max(1, ...elem.map((e) => e[1]));
  const top = areas.slice(0, 5).map((a) => a[0]);
  const hc = (a, p) => R.filter((x) => x.area === a && x.prio === p).length;
  const hmax = Math.max(1, ...top.map((a) => Math.max(hc(a, 'Alta'), hc(a, 'Media'), hc(a, 'Baja'))));
  const cell = (v) => { const o = v === 0 ? 0.05 : Math.max(0.28, v / hmax); return { height: 34, display: 'grid', placeItems: 'center', fontWeight: 600, color: o > 0.55 ? 'var(--color-bg)' : 'var(--color-text)', background: `color-mix(in srgb,var(--color-accent) ${Math.round(o * 100)}%,transparent)` }; };
  const th = { textAlign: 'center', fontSize: 10.5, letterSpacing: '.06em', textTransform: 'uppercase', color: mix(55) };
  return (
    <section className="ic-screen" style={{ padding: '24px 28px 40px', maxWidth: 1500 }}>
      <PageHead title="Dashboard Ejecutivo" sub={`Gestión de Tickets BPM · Infraestructura — PR-MAN-21 R01 · Datos en vivo · ${total} hallazgos`}>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <span className="tag tag-outline">Todas las áreas</span><span className="tag tag-neutral">2026</span>
          <button className={hv} style={{ fontSize: 12, padding: '5px 10px' }} onClick={() => go('plan')}>Ver Plan</button>
        </div>
      </PageHead>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 14 }}>
        {kpis.map(([l, v, s]) => (
          <Card key={l} style={{ gap: 6, padding: '14px 15px' }}>
            <Kicker style={{ color: mix(55) }}>{l}</Kicker>
            <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 600, fontSize: 30, lineHeight: 1, letterSpacing: '-.02em' }}>{v}</div>
            <div style={{ fontSize: 11, color: mix(52) }}>{s}</div>
          </Card>
        ))}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1.1fr 1.5fr 1fr', gap: 14, marginTop: 14 }}>
        <Card style={{ padding: 16 }}>
          <Kicker>Cumplimiento general del Plan</Kicker>
          <div style={{ display: 'flex', alignItems: 'center', gap: 18, marginTop: 6 }}>
            <svg width="128" height="128" viewBox="0 0 128 128" style={{ flex: 'none' }} role="img" aria-label={`Cumplimiento ${cumpl}%`}>
              <circle cx="64" cy="64" r="52" fill="none" stroke={mix(12)} strokeWidth="14" />
              <circle cx="64" cy="64" r="52" fill="none" stroke="var(--color-accent)" strokeWidth="14" strokeDasharray={`${((cumpl / 100) * 326.7).toFixed(0)} 327`} transform="rotate(-90 64 64)" />
              <text x="64" y="60" textAnchor="middle" fontFamily="var(--font-heading)" fontWeight="600" fontSize="30" fill="var(--color-text)">{cumpl}%</text>
              <text x="64" y="80" textAnchor="middle" fontSize="10" fill={mix(55)}>{cerrados} / {total} cerrados</text>
            </svg>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 9, fontSize: 12.5 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}><span style={{ width: 10, height: 10, background: 'var(--color-accent)' }} />Cerrados&nbsp;<strong>{cerrados}</strong></div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}><span style={{ width: 10, height: 10, background: mix(15) }} />Abiertos&nbsp;<strong>{abiertos}</strong></div>
              <div style={{ borderTop: '1px solid var(--color-divider)', paddingTop: 8, color: mix(60), fontSize: 11.5 }}>Meta mensual: <strong style={{ color: 'var(--ok)' }}>≥ 80%</strong></div>
            </div>
          </div>
        </Card>
        <Card style={{ padding: 16 }}>
          <Kicker>Hallazgos por estatus</Kicker>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 14 }}>
            {est.map(([name, color]) => <BarRow key={name} cols="160px 1fr 26px" name={name} dot={color} color={color} pct={pct(n(name), total) + '%'} value={n(name)} />)}
          </div>
          <div style={{ borderTop: '1px solid var(--color-divider)', paddingTop: 10, marginTop: 4, fontSize: 11.5, color: mix(58) }}>Flujo PR-MAN-21: Abierto → En proceso → Pendiente verificación → Cerrado</div>
        </Card>
        <Card style={{ padding: 16 }}>
          <Kicker>Prioridad · Hallazgos abiertos</Kicker>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 11, marginTop: 8 }}>
            {sla.map(([l, p, c]) => (
              <div key={p}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12.5, marginBottom: 4 }}><span style={{ display: 'flex', alignItems: 'center', gap: 7 }}><span style={{ width: 9, height: 9, borderRadius: '50%', background: c }} />{l}</span><strong>{abP(p)}</strong></div>
                <div style={{ height: 6, background: mix(9) }}><div style={{ height: '100%', width: pct(abP(p), abiertos) + '%', background: c }} /></div>
              </div>
            ))}
            <div style={{ borderTop: '1px solid var(--color-divider)', paddingTop: 9, fontSize: 11.5, color: mix(58) }}>{abiertos} hallazgos abiertos · clasificación ALTA / MEDIA / BAJA</div>
          </div>
        </Card>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginTop: 14 }}>
        <Card style={{ padding: 16 }}>
          <Kicker>Hallazgos por área</Kicker>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 9, marginTop: 10 }}>
            {areas.slice(0, 6).map(([a, c]) => <BarRow key={a} cols="190px 1fr 30px" name={a} pct={Math.round((c / amax) * 100) + '%'} value={c} />)}
          </div>
        </Card>
        <Card style={{ padding: 16 }}>
          <Kicker>Elementos de infraestructura afectados</Kicker>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 14, height: 170, marginTop: 16 }}>
            {elem.map(([name, c]) => (
              <div key={name} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5, height: '100%', justifyContent: 'flex-end' }}>
                <span style={{ fontSize: 12, fontWeight: 600 }}>{c}</span>
                <div style={{ width: '100%', background: 'var(--color-accent)', height: Math.round((c / emax) * 90 + 8) + '%' }} />
                <span style={{ fontSize: 10.5, color: mix(55), textAlign: 'center' }}>{name}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>
      <Card style={{ padding: 16, marginTop: 14 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Kicker>Heatmap de riesgo por área × prioridad</Kicker>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 10.5, color: mix(55) }}>Menor<span style={{ width: 14, height: 10, background: 'color-mix(in srgb,var(--color-accent) 20%,transparent)' }} /><span style={{ width: 14, height: 10, background: 'color-mix(in srgb,var(--color-accent) 55%,transparent)' }} /><span style={{ width: 14, height: 10, background: 'var(--color-accent)' }} />Mayor</div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '200px repeat(4,1fr)', gap: 5, marginTop: 12, fontSize: 12 }}>
          <div />{['Alta', 'Media', 'Baja', 'Total'].map((h) => <div key={h} style={th}>{h}</div>)}
          {top.map((a) => {
            const v = ['Alta', 'Media', 'Baja'].map((p) => hc(a, p));
            return (<React.Fragment key={a}>
              <div style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', alignSelf: 'center', color: mix(80) }}>{a}</div>
              {v.map((x, i) => <div key={i} style={cell(x)}>{x}</div>)}
              <div style={{ height: 34, display: 'grid', placeItems: 'center', fontWeight: 600, border: '1px solid var(--color-divider)' }}>{v[0] + v[1] + v[2]}</div>
            </React.Fragment>);
          })}
        </div>
      </Card>
    </section>
  );
}

// ───────── Plan
export function Plan({ R, view, filter, setFilter, openTicket, go, openImport }) {
  const opts = [['todos', 'Todos'], ['abiertos', 'Abiertos'], ['proceso', 'En proceso'], ['cerrados', 'Cerrados']];
  return (
    <section className="ic-screen" style={{ padding: '24px 28px 40px' }}>
      <PageHead title="Plan de Infraestructura" sub="Fuente única de verdad · PR-MAN-21-F02 — cada hallazgo genera Ticket y Orden de Trabajo automáticamente">
        <div style={{ display: 'flex', gap: 8 }}>
          <button className={hv} onClick={openImport}><Icon d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3" />Importar Excel</button>
          <button className="btn btn-primary" onClick={() => go('nuevo')}><Icon d="M12 5v14M5 12h14" sw={1.8} />Registrar Hallazgo</button>
        </div>
      </PageHead>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', margin: '0 0 16px' }}>
        <div className="seg">
          {opts.map(([k, l]) => (<label key={k} className="seg-opt"><input type="radio" name="pf" checked={filter === k} onChange={() => setFilter(k)} /><span>{l}</span></label>))}
        </div>
        <span style={{ alignSelf: 'center', fontSize: 12.5, color: mix(55) }}>{view.length} de {R.length} hallazgos</span>
      </div>
      <div className="blueprint" style={{ padding: 0 }}>
        <i className="corner tl" /><i className="corner tr" /><i className="corner bl" /><i className="corner br" />
        <div style={{ overflowX: 'auto' }}>
          <table className="table" style={{ minWidth: 1080 }}>
            <thead><tr>{['No. Ticket', 'Fecha', 'Área / Edificio', 'Elemento', 'Hallazgo', 'Prioridad', 'Ejecutor', 'Estatus', 'Fecha prog.', ''].map((h, i) => <th key={i} style={i === 4 ? { minWidth: 280 } : { whiteSpace: 'nowrap' }}>{h}</th>)}</tr></thead>
            <tbody>
              {view.map((t) => (
                <tr key={t.id} onClick={() => openTicket(t.id)} style={{ cursor: 'pointer' }}>
                  <td style={{ fontFamily: 'var(--font-heading)', fontWeight: 600, whiteSpace: 'nowrap', color: 'var(--color-accent)' }}>{t.id}</td>
                  <td style={{ whiteSpace: 'nowrap', color: mix(65) }}>{t.fecha}</td>
                  <td style={{ whiteSpace: 'nowrap' }}><div>{t.area}</div><div style={{ fontSize: 11, color: mix(55) }}>{t.edificio}</div></td>
                  <td style={{ whiteSpace: 'nowrap' }}>{t.categoria}</td>
                  <td style={{ fontSize: 12.5, color: mix(80), maxWidth: 340 }}><div style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{t.desc}</div></td>
                  <td><span className="tag" style={prioStyle(t.prio)}>{t.prio}</span></td>
                  <td style={{ whiteSpace: 'nowrap', fontSize: 12.5 }}>{t.ejecutor}</td>
                  <td><span className="tag" style={statusStyle(t.estatus)}>{t.estatus}</span></td>
                  <td style={{ whiteSpace: 'nowrap', color: mix(65) }}>{t.fechaProg}</td>
                  <td style={{ textAlign: 'right' }}><Icon d="m9 18 6-6-6-6" sw={1.7} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}

// ───────── Kanban
const COLS = [['Abierto', 'var(--color-neutral-500)'], ['En proceso', 'var(--color-accent)'], ['Pendiente verificación', 'var(--warn)'], ['Cerrado', 'var(--ok)']];
export function Kanban({ R, openTicket, setStatus }) {
  const drag = React.useRef(null);
  return (
    <section className="ic-screen" style={{ padding: '24px 28px 40px' }}>
      <PageHead title="Tablero Kanban de Hallazgos" sub="Arrastra una tarjeta a otra columna para cambiar su estatus — el cambio se guarda y actualiza el Dashboard e Indicadores" />
      <div className="ic-scroll" style={{ display: 'flex', gap: 14, overflowX: 'auto', paddingBottom: 8, alignItems: 'flex-start' }}>
        {COLS.map(([title, color]) => {
          const cards = R.filter((t) => t.estatus === title);
          return (
            <div key={title} className="ic-kcol" style={{ width: 290, flex: 'none', display: 'flex', flexDirection: 'column', gap: 10, minHeight: 160, padding: 8 }}
              onDragOver={(e) => e.preventDefault()}
              onDragEnter={(e) => { e.preventDefault(); e.currentTarget.classList.add('ic-over'); }}
              onDragLeave={(e) => { if (!e.currentTarget.contains(e.relatedTarget)) e.currentTarget.classList.remove('ic-over'); }}
              onDrop={(e) => { e.preventDefault(); e.currentTarget.classList.remove('ic-over'); if (drag.current) { setStatus(drag.current, title, `Movido a "${title}"`); drag.current = null; } }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 2px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}><span style={{ width: 9, height: 9, borderRadius: '50%', background: color }} /><span style={{ fontFamily: 'var(--font-heading)', fontWeight: 600, fontSize: 14 }}>{title}</span></div>
                <span className="tag tag-neutral">{cards.length}</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, flex: 1 }}>
                {cards.map((c) => (
                  <Card key={c.id} className="ic-lift" draggable onDragStart={() => { drag.current = c.id; }} onClick={() => openTicket(c.id)} style={{ gap: 8, padding: 12, cursor: 'grab', background: 'var(--color-bg)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}><span style={{ fontFamily: 'var(--font-heading)', fontWeight: 600, fontSize: 12, color: 'var(--color-accent)' }}>{c.id}</span><span className="tag" style={prioStyle(c.prio)}>{c.prio}</span></div>
                    <div style={{ fontSize: 12.5, lineHeight: 1.4, display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{c.desc}</div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: mix(55), borderTop: '1px solid var(--color-divider)', paddingTop: 8 }}><span>{c.area}</span><span>{c.ejecutor}</span></div>
                  </Card>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

// ───────── Tickets
export function Tickets({ view, openTicket }) {
  return (
    <section className="ic-screen" style={{ padding: '24px 28px 40px' }}>
      <PageHead title="Tickets" sub="Generados automáticamente desde el Plan de Infraestructura (PR-MAN-21-F01)" />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(340px,1fr))', gap: 14 }}>
        {view.map((t) => (
          <Card key={t.id} className="ic-lift" onClick={() => openTicket(t.id)} style={{ gap: 10, cursor: 'pointer' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}><span style={{ fontFamily: 'var(--font-heading)', fontWeight: 600, color: 'var(--color-accent)' }}>{t.id}</span><span className="tag" style={statusStyle(t.estatus)}>{t.estatus}</span></div>
            <div style={{ fontSize: 13, lineHeight: 1.45, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{t.desc}</div>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}><span className="tag" style={prioStyle(t.prio)}>{t.prio}</span><span className="tag tag-neutral">{t.categoria}</span><span className="tag tag-neutral">{t.ejecutor}</span></div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11.5, color: mix(55), borderTop: '1px solid var(--color-divider)', paddingTop: 9 }}><span>{t.area} · {t.edificio}</span><span>{t.fecha}</span></div>
          </Card>
        ))}
      </div>
    </section>
  );
}

// ───────── Indicadores
export function Indicadores({ R }) {
  const total = R.length, n = (s) => R.filter((x) => x.estatus === s).length;
  const cerr = n('Cerrado'), crit = R.filter((x) => x.prio === 'Alta').length, enp = n('En proceso'), pen = n('Pendiente verificación');
  const areas = countBy(R, (x) => x.area), elem = countBy(R, (x) => x.categoria), edi = countBy(R, (x) => x.edificio).slice(0, 4);
  const P = (v) => pct(v, total) + '%';
  const ind = [
    ['Cumplimiento del Plan', P(cerr), P(cerr), 'var(--color-accent)', `${cerr} / ${total} cerrados`],
    ['Hallazgos Prioridad Alta', P(crit), P(crit), 'var(--err)', `${crit} de ${total}`],
    ['En proceso', P(enp), P(enp), 'var(--color-accent)', `${enp} de ${total}`],
    ['Pendiente verificación', P(pen), P(pen), 'var(--warn)', `${pen} de ${total}`],
    ['Elemento más frecuente', elem[0] ? elem[0][0] : '—', elem[0] ? P(elem[0][1]) : '0%', 'var(--color-accent)', elem[0] ? `${elem[0][1]} de ${total}` : '—'],
    ['Área con más hallazgos', areas[0] ? areas[0][0].split(' ')[0] : '—', areas[0] ? P(areas[0][1]) : '0%', 'var(--color-accent)', areas[0] ? `${areas[0][1]} de ${total}` : '—'],
    ['Origen Recorrido / AUI', '100%', '100%', 'var(--ok)', `${total} de ${total} hallazgos`],
    ['MTTR / Costos', 'N/D', '4%', 'var(--color-neutral-500)', 'No capturado en PR-MAN-21'],
  ];
  const emax = Math.max(1, ...edi.map((e) => e[1]));
  return (
    <section className="ic-screen" style={{ padding: '24px 28px 40px', maxWidth: 1400 }}>
      <PageHead title="Indicadores" sub={`Calculados en vivo sobre ${total} hallazgos · se recalculan con cada cambio de estatus o alta`} />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 14 }}>
        {ind.map(([l, v, p, c, s]) => (
          <Card key={l} style={{ gap: 6, padding: 15 }}>
            <Kicker style={{ color: mix(55) }}>{l}</Kicker>
            <span style={{ fontFamily: 'var(--font-heading)', fontWeight: 600, fontSize: 26, lineHeight: 1 }}>{v}</span>
            <div style={{ height: 5, background: mix(9) }}><div style={{ height: '100%', width: p, background: c }} /></div>
            <span style={{ fontSize: 11, color: mix(55) }}>{s}</span>
          </Card>
        ))}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginTop: 14 }}>
        <Card style={{ padding: 16 }}>
          <Kicker>Cumplimiento por área (% cerrados)</Kicker>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 12 }}>
            {areas.slice(0, 5).map(([a, c]) => {
              const p = pct(R.filter((x) => x.area === a && x.estatus === 'Cerrado').length, c);
              return <BarRow key={a} cols="200px 1fr 42px" name={a} pct={p + '%'} value={p + '%'} h={15} color={p >= 80 ? 'var(--ok)' : p >= 40 ? 'var(--warn)' : 'var(--err)'} />;
            })}
          </div>
        </Card>
        <Card style={{ padding: 16 }}>
          <Kicker>Hallazgos por edificio</Kicker>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 24, height: 180, marginTop: 16, padding: '0 12px' }}>
            {edi.map(([name, c]) => (
              <div key={name} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, height: '100%', justifyContent: 'flex-end' }}>
                <span style={{ fontSize: 14, fontWeight: 600, fontFamily: 'var(--font-heading)' }}>{c}</span>
                <div style={{ width: '100%', background: 'var(--color-accent)', height: Math.round((c / emax) * 90 + 8) + '%' }} />
                <span style={{ fontSize: 11, color: mix(55) }}>{name}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </section>
  );
}

// ───────── Contratistas
export function Contratistas({ R }) {
  const prov = countBy(R, (x) => x.proveedor || x.ejecutor);
  const pie = R.filter((x) => x.proveedor === 'Proveedor Imp-Rex');
  const pc = pie.filter((x) => x.estatus === 'Cerrado').length, pp = pie.filter((x) => x.estatus === 'En proceso').length;
  const mx = Math.max(1, ...prov.map((p) => p[1]));
  const big = { fontFamily: 'var(--font-heading)', fontWeight: 600, fontSize: 24 };
  return (
    <section className="ic-screen" style={{ padding: '24px 28px 40px', maxWidth: 1400 }}>
      <PageHead title="Contratistas · Dashboard PIE" sub="Ejecutores del Plan según PR-MAN-21 · conteos en vivo" />
      <div style={{ display: 'grid', gridTemplateColumns: '1.3fr 1fr', gap: 14 }}>
        <Card style={{ gap: 14 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div><h4 style={{ margin: 0 }}>Proveedor Imp-Rex (PIE)</h4><div style={{ fontSize: 12, color: mix(55) }}>Obra civil · pisos epóxicos · sellado sanitario</div></div>
            <span className="tag tag-accent">PIE</span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12 }}>
            <div><Kicker>Asignados</Kicker><div style={big}>{pie.length}</div></div>
            <div><Kicker>Cerrados</Kicker><div style={{ ...big, color: 'var(--ok)' }}>{pc}</div></div>
            <div><Kicker>En proceso</Kicker><div style={{ ...big, color: 'var(--color-accent)' }}>{pp}</div></div>
            <div><Kicker>Cumplimiento</Kicker><div style={big}>{pie.length ? pct(pc, pie.length) + '%' : '—'}</div></div>
          </div>
          <div style={{ borderTop: '1px solid var(--color-divider)', paddingTop: 12 }}>
            <Kicker style={{ marginBottom: 8 }}>Hallazgos por ejecutor / recurso</Kicker>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
              {prov.slice(0, 5).map(([n, c]) => <BarRow key={n} cols="170px 1fr 26px" name={n} pct={Math.round((c / mx) * 100) + '%'} value={c} h={15} />)}
            </div>
          </div>
        </Card>
        <Card style={{ gap: 10 }}>
          <Kicker>Ejecutores del Plan</Kicker>
          {prov.slice(0, 5).map(([n, c], i) => (
            <div key={n} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '11px 0', borderBottom: `1px solid ${mix(7)}` }}>
              <span style={{ width: 26, height: 26, flex: 'none', display: 'grid', placeItems: 'center', fontFamily: 'var(--font-heading)', fontWeight: 600, fontSize: 13, border: '1px solid var(--color-divider)' }}>{i + 1}</span>
              <div style={{ flex: 1, minWidth: 0 }}><div style={{ fontSize: 13.5, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{n}</div><div style={{ fontSize: 11, color: mix(55) }}>{c} hallazgos · {R.filter((x) => (x.proveedor || x.ejecutor) === n && x.estatus === 'Cerrado').length} cerrados</div></div>
              <span style={{ fontFamily: 'var(--font-heading)', fontWeight: 600, fontSize: 16, color: 'var(--color-accent)' }}>{c}</span>
            </div>
          ))}
        </Card>
      </div>
    </section>
  );
}
