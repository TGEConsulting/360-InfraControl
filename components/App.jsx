'use client';
import React from 'react';
import { Icon, Corners, mix } from './ui';
import { Dashboard, Plan, Kanban, Tickets, Indicadores, Contratistas } from './screens';
import { Detalle, Orden, Nuevo, otOf } from './screens2';
import { ImportModal } from './ImportModal';

const NAV = [
  ['Operación', [
    ['dashboard', 'Dashboard', 'M3 3h7v9H3zM14 3h7v5h-7zM14 12h7v9h-7zM3 16h7v5H3z'],
    ['plan', 'Plan de Infraestructura', 'M9 4H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2h-3M8 2h8v4H8zM8 11h8M8 15h6'],
    ['kanban', 'Tablero Kanban', 'M3 4h5v16H3zM10 4h5v10h-5zM17 4h4v13h-4z'],
    ['tickets', 'Tickets', 'M3 8a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v2a2 2 0 0 0 0 4v2a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-2a2 2 0 0 0 0-4zM13 6v12'],
    ['orden', 'Órdenes de Trabajo', 'M14.7 6.3a4 4 0 0 0-5.4 5.4L3 18v3h3l6.3-6.3a4 4 0 0 0 5.4-5.4l-2.5 2.5-2-2z'],
  ]],
  ['Análisis', [
    ['indicadores', 'Indicadores', 'M3 3v18h18M7 15l4-5 3 3 5-7'],
    ['contratistas', 'Contratistas PIE', 'M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM22 21v-2a4 4 0 0 0-3-3.87M16 3.13A4 4 0 0 1 16 11'],
  ]],
];
const CRUMB = { dashboard: 'Dashboard', plan: 'Plan de Infraestructura', kanban: 'Tablero Kanban', tickets: 'Tickets', nuevo: 'Nuevo Hallazgo', indicadores: 'Indicadores', contratistas: 'Contratistas PIE' };
const sectionLabel = { fontSize: 9.5, letterSpacing: '.12em', textTransform: 'uppercase', color: mix(42) };
const navBase = { display: 'flex', alignItems: 'center', gap: 11, padding: '9px 16px', fontFamily: 'var(--font-heading)', fontWeight: 600, fontSize: 14.5, letterSpacing: '.01em', cursor: 'pointer', borderLeft: '2px solid transparent', background: 'none', border: 0, borderLeftWidth: 2, borderLeftStyle: 'solid', width: '100%', textAlign: 'left' };

async function api(path, opts) {
  const res = await fetch(path, { headers: { 'Content-Type': 'application/json' }, ...opts });
  if (!res.ok) throw new Error((await res.json().catch(() => ({}))).error || res.statusText);
  return res.json();
}

export default function App() {
  const [R, setR] = React.useState(null);
  const [route, setRoute] = React.useState('dashboard');
  const [theme, setTheme] = React.useState('light');
  const [selId, setSelId] = React.useState(null);
  const [filter, setFilter] = React.useState('todos');
  const [query, setQuery] = React.useState('');
  const [importOpen, setImportOpen] = React.useState(false);
  const [toast, setToast] = React.useState('');
  const [error, setError] = React.useState('');
  const timer = React.useRef(null);

  const flash = (m) => { setToast(m); clearTimeout(timer.current); timer.current = setTimeout(() => setToast(''), 4200); };
  React.useEffect(() => { api('/api/hallazgos').then(setR).catch((e) => setError(e.message)); }, []);
  React.useEffect(() => { try { const t = localStorage.getItem('ic360-theme'); if (t) setTheme(t); } catch {} }, []);

  if (error) return <div style={{ padding: 40 }}>No se pudo cargar la base de datos: {error}</div>;
  if (!R) return <div style={{ padding: 40, color: mix(60) }}>Cargando InfraControl 360…</div>;

  const go = (r) => setRoute(r);
  const selR = R.find((x) => x.id === selId) || R[0];
  const openTicket = (id) => { setSelId(id); setRoute('detalle'); };

  // Actualización optimista + persistencia en Neon
  const patch = async (id, changes, msg) => {
    const prev = R;
    setR((rs) => rs.map((r) => (r.id === id ? { ...r, ...changes } : r)));
    try { const saved = await api('/api/hallazgos/' + id, { method: 'PATCH', body: JSON.stringify(changes) }); setR((rs) => rs.map((r) => (r.id === id ? saved : r))); if (msg) flash(msg); }
    catch (e) { setR(prev); flash('No se pudo guardar: ' + e.message); }
  };
  const actions = {
    setStatus: (id, estatus, msg) => {
      const r = R.find((x) => x.id === id); let checklist = r.checklist;
      if (estatus === 'Cerrado') checklist = checklist.map((x) => ({ ...x, done: true }));
      if (estatus === 'Abierto') checklist = checklist.map((x) => ({ ...x, done: false }));
      patch(id, { estatus, checklist, validacion: estatus === 'Cerrado' ? { estado: 'Aprobada', motivo: '' } : r.validacion }, msg);
    },
    toggleCheck: (id, i) => { const r = R.find((x) => x.id === id); patch(id, { checklist: r.checklist.map((c, k) => (k === i ? { ...c, done: !c.done } : c)) }); },
    setPrio: (id, prio) => patch(id, { prio }, 'Prioridad actualizada a ' + prio),
    addComment: (id, text) => { const r = R.find((x) => x.id === id); patch(id, { comments: [...r.comments, { text, user: 'Jefe de Mantenimiento', time: 'ahora' }] }); },
    reject: (id) => { const m = window.prompt('Motivo de rechazo de la validación:'); if (m && m.trim()) patch(id, { estatus: 'En proceso', validacion: { estado: 'Rechazada', motivo: m.trim() } }, 'Validación rechazada — OT regresada a En ejecución'); },
  };
  const create = async (h) => {
    try { const [rec] = await api('/api/hallazgos', { method: 'POST', body: JSON.stringify({ hallazgo: h }) }); setR((rs) => [...rs, rec]); setSelId(rec.id); setRoute('detalle'); flash('Hallazgo creado — Ticket y Orden de Trabajo generados'); }
    catch (e) { flash('No se pudo crear: ' + e.message); }
  };
  const doImport = async (rows) => {
    try { const out = await api('/api/hallazgos', { method: 'POST', body: JSON.stringify({ hallazgos: rows }) }); setR((rs) => [...rs, ...out]); setImportOpen(false); flash(out.length + ' hallazgos importados con folio consecutivo del sistema'); }
    catch (e) { flash('No se pudo importar: ' + e.message); }
  };
  const reset = async () => { if (!window.confirm('¿Restablecer los datos a los 7 hallazgos originales? Se borrarán los hallazgos agregados.')) return; try { setR(await api('/api/hallazgos', { method: 'DELETE' })); setRoute('dashboard'); flash('Datos restablecidos a los 7 hallazgos originales'); } catch (e) { flash(e.message); } };
  const toggleTheme = () => setTheme((t) => { const n = t === 'dark' ? 'light' : 'dark'; try { localStorage.setItem('ic360-theme', n); } catch {} return n; });

  const q = query.toLowerCase();
  const view = R.filter((t) => {
    const mF = filter === 'todos' || (filter === 'abiertos' && t.estatus === 'Abierto') || (filter === 'proceso' && t.estatus === 'En proceso') || (filter === 'cerrados' && t.estatus === 'Cerrado');
    return mF && (!q || [t.id, t.area, t.edificio, t.categoria, t.desc, t.ejecutor, t.norma, t.prio].join(' ').toLowerCase().includes(q));
  });
  const nextNum = R.reduce((m, r) => Math.max(m, parseInt(String(r.id).slice(-6), 10)), 0);
  const active = route === 'detalle' ? 'plan' : route;
  const crumb = route === 'detalle' ? selR.id : route === 'orden' ? otOf(selR) : CRUMB[route];

  return (
    <div data-theme={theme} style={{ display: 'flex', minHeight: '100vh', background: 'var(--color-bg)', color: 'var(--color-text)', fontFamily: 'var(--font-body)' }}>
      <aside style={{ width: 250, flex: 'none', background: 'var(--ic-sidebar)', borderRight: '1px solid var(--color-divider)', display: 'flex', flexDirection: 'column', position: 'sticky', top: 0, height: '100vh' }}>
        <div style={{ padding: '18px 16px 14px', borderBottom: '1px solid var(--color-divider)', display: 'flex', alignItems: 'center', gap: 11 }}>
          <div className="blueprint" style={{ width: 34, height: 34, display: 'grid', placeItems: 'center', flex: 'none' }}>
            <Corners /><Icon d="M3 21h18M5 21V7l7-4 7 4v14M9 21v-5h6v5M9 11h.01M15 11h.01" size={19} style={{ color: 'var(--color-accent)' }} />
          </div>
          <div style={{ lineHeight: 1.1 }}>
            <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 600, fontSize: 16, letterSpacing: '.01em' }}>InfraControl 360</div>
            <div style={{ fontSize: 10, letterSpacing: '.06em', textTransform: 'uppercase', color: mix(52) }}>Lácteos La Quinta</div>
          </div>
        </div>
        <nav className="ic-scroll" style={{ flex: 1, overflowY: 'auto', padding: '10px 0', display: 'flex', flexDirection: 'column', gap: 1 }}>
          {NAV.map(([sec, items]) => (<React.Fragment key={sec}>
            <div style={{ ...sectionLabel, padding: '8px 16px 4px' }}>{sec}</div>
            {items.map(([k, label, d]) => {
              const on = active === k;
              return (<button key={k} className="ic-hover" aria-current={on ? 'page' : undefined} onClick={() => go(k)}
                style={{ ...navBase, color: on ? 'var(--color-accent-700)' : mix(78), background: on ? 'color-mix(in srgb,var(--color-accent) 13%,transparent)' : 'none', borderLeftColor: on ? 'var(--color-accent)' : 'transparent' }}>
                <Icon d={d} size={17} sw={1.5} /><span>{label}</span></button>);
            })}
          </React.Fragment>))}
          <div style={{ ...sectionLabel, padding: '12px 16px 4px' }}>Sistema</div>
          <button className="ic-hover" onClick={reset} style={{ ...navBase, color: mix(62) }}><Icon d="M3 12a9 9 0 1 0 3-6.7L3 8M3 3v5h5" size={17} sw={1.5} /><span>Restablecer datos</span></button>
        </nav>
        <div style={{ padding: '12px 16px', borderTop: '1px solid var(--color-divider)', display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--color-accent)', color: 'var(--color-bg)', display: 'grid', placeItems: 'center', fontFamily: 'var(--font-heading)', fontWeight: 600, fontSize: 13, flex: 'none' }}>JM</div>
          <div style={{ lineHeight: 1.15, minWidth: 0 }}>
            <div style={{ fontSize: 13, fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>Jefe de Mantenimiento</div>
            <div style={{ fontSize: 10.5, color: mix(52) }}>PR-MAN-21 · Rev. 01</div>
          </div>
        </div>
      </aside>

      <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
        <header style={{ position: 'sticky', top: 0, zIndex: 20, background: 'color-mix(in srgb,var(--color-bg) 90%,transparent)', backdropFilter: 'blur(8px)', borderBottom: '1px solid var(--color-divider)', display: 'flex', alignItems: 'center', gap: 16, padding: '11px 24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: mix(60) }}>
            <span style={{ fontFamily: 'var(--font-heading)', fontWeight: 600 }}>InfraControl</span><span style={{ opacity: 0.5 }}>/</span>
            <span style={{ color: 'var(--color-text)', fontFamily: 'var(--font-heading)', fontWeight: 600 }}>{crumb}</span>
          </div>
          <div style={{ flex: 1, maxWidth: 420, marginLeft: 8 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'var(--color-surface)', border: '1px solid var(--color-divider)', padding: '6px 11px' }}>
              <Icon d="M21 21l-4.3-4.3M11 18a7 7 0 1 0 0-14 7 7 0 0 0 0 14z" style={{ color: mix(50), flex: 'none' }} />
              <input aria-label="Buscar" placeholder="Buscar ticket, área, equipo, norma…" value={query} onChange={(e) => setQuery(e.target.value)} onFocus={() => { if (!['plan', 'tickets'].includes(route)) go('plan'); }} style={{ border: 0, background: 'transparent', outline: 'none', font: 'inherit', fontSize: 13, color: 'var(--color-text)', width: '100%' }} />
            </div>
          </div>
          <div style={{ flex: 1 }} />
          <button className="btn btn-primary" onClick={() => go('nuevo')}><Icon d="M12 5v14M5 12h14" sw={1.8} />Nuevo Hallazgo</button>
          <button className="btn btn-secondary btn-icon" onClick={toggleTheme} title="Cambiar tema" aria-label="Cambiar tema">
            <Icon size={17} d={theme === 'dark' ? 'M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8zM12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4' : 'M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z'} />
          </button>
        </header>

        <main className="ic-scroll" style={{ flex: 1, overflowY: 'auto' }}>
          {route === 'dashboard' && <Dashboard R={R} go={go} />}
          {route === 'plan' && <Plan R={R} view={view} filter={filter} setFilter={setFilter} openTicket={openTicket} go={go} openImport={() => setImportOpen(true)} />}
          {route === 'kanban' && <Kanban R={R} openTicket={openTicket} setStatus={actions.setStatus} />}
          {route === 'tickets' && <Tickets view={view} openTicket={openTicket} />}
          {route === 'detalle' && <Detalle key={selR.id} r={selR} go={go} actions={actions} />}
          {route === 'orden' && <Orden r={selR} go={go} actions={actions} />}
          {route === 'nuevo' && <Nuevo go={go} onCreate={create} />}
          {route === 'indicadores' && <Indicadores R={R} />}
          {route === 'contratistas' && <Contratistas R={R} />}
          {importOpen && <ImportModal nextNum={nextNum} onClose={() => setImportOpen(false)} onImport={doImport} flash={flash} />}
          {toast && (
            <div role="status" className="ic-screen" style={{ position: 'fixed', bottom: 24, right: 24, zIndex: 60, background: 'var(--color-accent-700)', color: '#fff', padding: '12px 18px', boxShadow: 'var(--shadow-lg)', display: 'flex', alignItems: 'center', gap: 10, fontSize: 13.5, fontFamily: 'var(--font-heading)', fontWeight: 600, maxWidth: 380 }}>
              <Icon d="M20 6 9 17l-5-5" size={18} sw={2} style={{ flex: 'none' }} />{toast}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
