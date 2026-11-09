'use client';
import React from 'react';
import { Card, Kicker, Icon, Timeline, mix, prioStyle, statusStyle } from './ui';

export const otOf = (r) => 'OT-2026-' + String(r.folio).slice(-6);
export const avanceOf = (r) => Math.round((r.checklist.filter((c) => c.done).length / r.checklist.length) * 100);

export function buildTimeline(r) {
  const ac = 'var(--color-accent)', wn = 'var(--warn)', ok = 'var(--ok)', er = 'var(--err)', ne = 'var(--color-neutral-500)';
  const tl = [
    { action: 'Hallazgo registrado', note: `Generado desde recorrido de inocuidad · Ticket ${r.id} creado + correo enviado.`, time: r.fecha, user: r.reportadoPor, color: ac },
    { action: 'Ticket recibido por Mantenimiento', note: `Verificación de información · prioridad ${r.prio}.`, time: r.fecha, user: 'Jefe de Mantenimiento', color: ac },
    { action: 'Orden de Trabajo generada', note: `${otOf(r)} → ${r.proveedor} (PR-MAN-17).`, time: r.fecha, user: 'Sistema', color: ac },
  ];
  if (['En proceso', 'Pendiente verificación', 'Cerrado'].includes(r.estatus)) tl.push({ action: 'En ejecución', note: `Intervención técnica con inocuidad — avance ${avanceOf(r)}%.`, time: 'Programado ' + r.fechaProg, user: r.proveedor, color: wn });
  if (r.validacion.estado === 'Rechazada') tl.push({ action: 'Validación rechazada', note: `${r.validacion.motivo} — OT regresada a En ejecución.`, time: '—', user: 'Coordinador de Inocuidad', color: er });
  if (['Pendiente verificación', 'Cerrado'].includes(r.estatus)) tl.push({ action: 'Enviada a validación', note: 'Cierre de OT — pendiente liberación de Inocuidad.', time: '—', user: 'Jefe de Mantenimiento', color: ac });
  if (r.estatus === 'Cerrado') tl.push({ action: 'Cerrado con liberación de Inocuidad', note: 'Evidencia de cierre registrada en Plan de Infraestructura.', time: '—', user: 'Coordinador de Inocuidad', color: ok });
  else tl.push({ action: 'Próximo paso', note: r.estatus === 'Abierto' ? 'Iniciar ejecución de la acción correctiva.' : r.estatus === 'En proceso' ? 'Completar checklist y enviar a validación.' : 'Aprobar o rechazar la validación.', time: '—', user: '—', color: ne });
  r.comments.forEach((c) => tl.push({ action: 'Comentario', note: c.text, time: c.time, user: c.user, color: ac }));
  return tl;
}

const Back = ({ onClick, children }) => (
  <button className="btn btn-ghost" onClick={onClick} style={{ marginBottom: 10, paddingLeft: 0 }}><Icon d="m15 18-6-6 6-6" sw={1.8} />{children}</button>
);
const Field = ({ label, children }) => (<div><Kicker>{label}</Kicker><div style={{ fontSize: 13.5, marginTop: 3 }}>{children}</div></div>);

// ───────── Detalle de ticket
export function Detalle({ r, go, actions }) {
  const [comment, setComment] = React.useState('');
  const send = () => { if (comment.trim()) { actions.addComment(r.id, comment.trim()); setComment(''); } };
  const st = r.estatus;
  return (
    <section className="ic-screen" style={{ padding: '20px 28px 40px', maxWidth: 1300 }}>
      <Back onClick={() => go('plan')}>Volver al Plan</Back>
      <div style={{ display: 'grid', gridTemplateColumns: '1.7fr 1fr', gap: 16, alignItems: 'start' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <Card style={{ gap: 12 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, flexWrap: 'wrap' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}><h3 style={{ margin: 0 }}>{r.id}</h3><span className="tag" style={prioStyle(r.prio)}>Prioridad&nbsp;{r.prio}</span><span className="tag" style={statusStyle(st)}>{st}</span></div>
                <div style={{ fontSize: 12.5, color: mix(55), marginTop: 4 }}>Hallazgo {r.folio} · Registrado {r.fecha} por {r.reportadoPor}</div>
              </div>
              <button className="btn btn-primary" onClick={() => go('orden')}>Ver Orden de Trabajo</button>
            </div>
            {r.validacion.estado === 'Rechazada' && (
              <div role="alert" style={{ display: 'flex', gap: 9, alignItems: 'flex-start', background: 'var(--err-bg)', border: '1px solid color-mix(in srgb,var(--err) 30%,transparent)', padding: '10px 12px', fontSize: 12.5, color: 'var(--err)' }}>
                <Icon d="M12 9v4M12 17h.01M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z" size={16} sw={1.7} style={{ flex: 'none', marginTop: 1 }} />
                <span><strong>Validación rechazada.</strong> {r.validacion.motivo} — OT regresada a "En ejecución".</span>
              </div>
            )}
            <div style={{ borderTop: '1px solid var(--color-divider)', paddingTop: 12 }}><Kicker>Hallazgo (descripción completa)</Kicker><p style={{ margin: '6px 0 0', fontSize: 14, lineHeight: 1.5 }}>{r.desc}</p></div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12, borderTop: '1px solid var(--color-divider)', paddingTop: 12 }}>
              <Field label="Área">{r.area}</Field><Field label="Edificio">{r.edificio}</Field><Field label="Elemento">{r.categoria}</Field><Field label="Tipo">{r.tipo}</Field>
              <Field label="Origen">{r.origen}</Field><Field label="Norma aplicable">{r.norma}</Field><Field label="Fecha programada">{r.fechaProg}</Field>
              <div><Kicker>Costo estimado</Kicker><div style={{ fontSize: 13.5, marginTop: 3, color: mix(55) }}>{r.costoEst}</div></div>
            </div>
            <div style={{ borderTop: '1px solid var(--color-divider)', paddingTop: 12 }}><Kicker>Observaciones</Kicker><p style={{ margin: '6px 0 0', fontSize: 13.5, lineHeight: 1.5, color: mix(80) }}>{r.obs}</p></div>
          </Card>
          <Card style={{ gap: 12 }}>
            <Kicker>Acciones del ticket</Kicker>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {st === 'Abierto' && <button className="btn btn-primary" onClick={() => actions.setStatus(r.id, 'En proceso', 'Ejecución iniciada')}>Iniciar ejecución</button>}
              {st === 'En proceso' && <button className="btn btn-primary" onClick={() => actions.setStatus(r.id, 'Pendiente verificación', 'Enviado a validación de Inocuidad')}>Enviar a validación</button>}
              {st === 'Pendiente verificación' && (<>
                <button className="btn btn-primary" onClick={() => actions.setStatus(r.id, 'Cerrado', 'Ticket cerrado con liberación de Inocuidad')}><Icon d="M20 6 9 17l-5-5" size={14} sw={1.9} />Aprobar y cerrar</button>
                <button className="btn btn-secondary" style={{ borderColor: 'color-mix(in srgb,var(--err) 40%,transparent)', color: 'var(--err)' }} onClick={() => actions.reject(r.id)}>Rechazar</button>
              </>)}
              {st === 'Cerrado' && <button className="btn btn-secondary" onClick={() => actions.setStatus(r.id, 'Abierto', 'Ticket reabierto')}><Icon d="M3 12a9 9 0 1 0 3-6.7L3 8M3 3v5h5" size={14} sw={1.7} />Reabrir</button>}
            </div>
            <div style={{ borderTop: '1px solid var(--color-divider)', paddingTop: 11 }}>
              <Kicker style={{ marginBottom: 7 }}>Reclasificar prioridad</Kicker>
              <div className="seg">{['Alta', 'Media', 'Baja'].map((p) => (<label key={p} className="seg-opt"><input type="radio" name="selprio" checked={r.prio === p} onChange={() => actions.setPrio(r.id, p)} /><span>{p}</span></label>))}</div>
            </div>
          </Card>
        </div>
        <Card style={{ gap: 14 }}>
          <Kicker>Línea de tiempo · Trazabilidad</Kicker>
          <Timeline items={buildTimeline(r)} />
          <div style={{ display: 'flex', gap: 8, borderTop: '1px solid var(--color-divider)', paddingTop: 12 }}>
            <input className="input" aria-label="Comentario" value={comment} onChange={(e) => setComment(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && send()} placeholder="Escribe un comentario…" style={{ flex: 1, fontSize: 13 }} />
            <button className="btn btn-primary" onClick={send} style={{ padding: '6px 12px' }}>Enviar</button>
          </div>
        </Card>
      </div>
    </section>
  );
}

// ───────── Orden de trabajo
export function Orden({ r, go, actions }) {
  const av = avanceOf(r) + '%';
  const sm = { fontSize: 11, color: mix(55) };
  return (
    <section className="ic-screen" style={{ padding: '20px 28px 40px', maxWidth: 1300 }}>
      <Back onClick={() => go('detalle')}>Volver al Ticket</Back>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap', marginBottom: 6 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}><h2 style={{ margin: 0 }}>{otOf(r)}</h2><span className="tag" style={statusStyle(r.estatus)}>{r.estatus}</span></div>
          <p style={{ margin: '4px 0 0', fontSize: 13, color: mix(60) }}>Derivada de {r.id} · {r.area} — {r.categoria}</p>
        </div>
        {r.estatus === 'En proceso' && <button className="btn btn-primary" onClick={() => actions.setStatus(r.id, 'Pendiente verificación', 'Enviado a validación de Inocuidad')}><Icon d="M20 6 9 17l-5-5" sw={1.8} />Enviar a validación</button>}
      </div>
      <p style={{ margin: '0 0 16px', fontSize: 12, color: mix(50), fontStyle: 'italic' }}>Marca los ítems del checklist para actualizar el avance en tiempo real. Horas-hombre y costo no se capturan en PR-MAN-21.</p>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12, marginBottom: 16 }}>
        <Card style={{ gap: 4, padding: 13 }}><Kicker>Avance del checklist</Kicker><span style={{ fontFamily: 'var(--font-heading)', fontWeight: 600, fontSize: 24 }}>{av}</span><div style={{ height: 5, background: mix(10) }}><div style={{ height: '100%', width: av, background: 'var(--color-accent)' }} /></div></Card>
        <Card style={{ gap: 4, padding: 13 }}><Kicker>Horas hombre</Kicker><span style={{ fontFamily: 'var(--font-heading)', fontWeight: 600, fontSize: 24, color: mix(55) }}>N/D</span><span style={sm}>No capturado</span></Card>
        <Card style={{ gap: 4, padding: 13 }}><Kicker>Costo real / est.</Kicker><span style={{ fontFamily: 'var(--font-heading)', fontWeight: 600, fontSize: 19, lineHeight: 1.1, color: mix(55) }}>No especificado</span><span style={sm}>Sin dato en fuente</span></Card>
        <Card style={{ gap: 4, padding: 13 }}><Kicker>Contratista / recurso</Kicker><span style={{ fontFamily: 'var(--font-heading)', fontWeight: 600, fontSize: 19, lineHeight: 1.1, marginTop: 2 }}>{r.proveedor}</span><span style={sm}>Ejecutor: {r.ejecutor}</span></Card>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.3fr', gap: 16, alignItems: 'start' }}>
        <Card style={{ gap: 6 }}>
          <Kicker>Checklist de ejecución</Kicker>
          <div style={{ display: 'flex', flexDirection: 'column', marginTop: 6 }}>
            {r.checklist.map((c, i) => (
              <label key={c.label} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 0', borderBottom: `1px solid ${mix(7)}`, cursor: 'pointer' }}>
                <input type="checkbox" checked={c.done} onChange={() => actions.toggleCheck(r.id, i)} style={{ position: 'absolute', opacity: 0, pointerEvents: 'none' }} />
                <span style={{ width: 18, height: 18, flex: 'none', display: 'grid', placeItems: 'center', border: `1.5px solid ${c.done ? 'var(--color-accent)' : 'var(--color-divider)'}`, background: c.done ? 'var(--color-accent)' : 'transparent', color: 'var(--color-bg)', fontSize: 12 }}>{c.done ? '✓' : ''}</span>
                <span style={{ fontSize: 13.5, color: c.done ? undefined : mix(80) }}>{c.label}</span>
              </label>
            ))}
          </div>
        </Card>
        <Card style={{ gap: 10 }}><Kicker>Línea de tiempo · Seguimiento (tipo Jira)</Kicker><Timeline items={buildTimeline(r)} /></Card>
      </div>
    </section>
  );
}

// ───────── Nuevo hallazgo
const OPT = {
  origen: ['Recorrido / AUI', 'Recorrido', 'Hallazgo', 'Correo', 'Otra'],
  reportadoPor: ['Coordinador de Inocuidad', 'Coordinador de Seguridad e Higiene', 'Jefe de SHE', 'Supervisor de SHE'],
  area: ['Recepción de Leche', 'Área de Queso Oaxaca', 'Almacén de Materias Primas', 'Accesos y Pasillos', 'Pasteurización', 'Envasado Aséptico', 'Área de Crema', 'Laboratorio'],
  edificio: ['Nave 1', 'Nave 2', 'Nave 3', 'Almacén Principal', 'Oficinas Centrales', 'Patio / Exterior'],
  tipo: ['Infraestructura', 'Equipo', 'Servicio', 'Higiene'],
  categoria: ['Piso', 'Techo', 'Pared', 'Ventana', 'Luminaria', 'Curva Sanitaria', 'Drenaje/Coladera', 'Tubería de Vapor'],
  norma: ['ISO 22002-100:2025', 'ISO 22102-1:2025', 'FSSC 22000 v7', 'NOM-251-SSA1-2009'],
  ejecutor: ['Mtto. interno', 'Proveedor Imp-Rex', 'Póliza', 'Servicio'],
};
export function Nuevo({ go, onCreate }) {
  const [f, setF] = React.useState({ fecha: '20 Jul 2026', origen: OPT.origen[0], reportadoPor: OPT.reportadoPor[0], area: OPT.area[0], edificio: OPT.edificio[0], tipo: OPT.tipo[0], categoria: OPT.categoria[0], norma: OPT.norma[0], ejecutor: OPT.ejecutor[0], desc: '', prio: 'Alta', fechaProg: '—', proveedor: 'Mtto. interno', accion: '' });
  const [busy, setBusy] = React.useState(false);
  const set = (k) => (e) => setF((s) => ({ ...s, [k]: e.target.value }));
  const Sel = ({ k, label }) => (<div className="field"><label htmlFor={'f_' + k}>{label}</label><select id={'f_' + k} className="input" value={f[k]} onChange={set(k)}>{OPT[k].map((o) => <option key={o}>{o}</option>)}</select></div>);
  const Txt = ({ k, label }) => (<div className="field"><label htmlFor={'f_' + k}>{label}</label><input id={'f_' + k} className="input" value={f[k]} onChange={set(k)} /></div>);
  const submit = async () => { setBusy(true); await onCreate({ ...f, proveedor: f.proveedor || f.ejecutor, obs: 'Alta manual desde InfraControl 360.' }); setBusy(false); };
  const g3 = { display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 14 };
  return (
    <section className="ic-screen" style={{ padding: '24px 28px 40px', maxWidth: 960 }}>
      <Back onClick={() => go('plan')}>Cancelar</Back>
      <h2 style={{ margin: 0 }}>Registrar Hallazgo</h2>
      <p style={{ margin: '4px 0 18px', fontSize: 13, color: mix(60) }}>Al guardar se asigna folio consecutivo y se crean automáticamente el <strong>Ticket</strong> y la <strong>Orden de Trabajo</strong>.</p>
      <Card style={{ gap: 18 }}>
        <div style={g3}>
          <Txt k="fecha" label="Fecha reporte" /><Sel k="origen" label="Origen" /><Sel k="reportadoPor" label="Reportado por" />
          <Sel k="area" label="Área" /><Sel k="edificio" label="Edificio" /><Sel k="tipo" label="Categoría" />
          <Sel k="categoria" label="Elemento / Tipo" /><Sel k="norma" label="Norma aplicable" /><Sel k="ejecutor" label="Ejecutor / recurso" />
        </div>
        <div className="field"><label htmlFor="f_desc">Hallazgo (descripción completa)</label><textarea id="f_desc" className="input" value={f.desc} onChange={set('desc')} placeholder="Describe el hallazgo, ubicación exacta y el riesgo de inocuidad asociado…" /></div>
        <div style={g3}>
          <div className="field"><label>Prioridad</label>
            <div style={{ display: 'flex', gap: 8 }}>{['Alta', 'Media', 'Baja'].map((p) => (
              <label key={p} className="radio" style={{ border: '1px solid var(--color-divider)', padding: '6px 10px', flex: 1, justifyContent: 'center' }}><input type="radio" name="f_prio" checked={f.prio === p} onChange={() => setF((s) => ({ ...s, prio: p }))} /><span className="dot" />{p}</label>
            ))}</div>
          </div>
          <Txt k="fechaProg" label="Fecha programada" /><Txt k="proveedor" label="Proveedor / recurso" />
        </div>
        <div className="field"><label htmlFor="f_accion">Acción correctiva recomendada</label><textarea id="f_accion" className="input" style={{ minHeight: 64 }} value={f.accion} onChange={set('accion')} placeholder="Enumerar actividades / materiales / alcance necesarios para liberar y cerrar el hallazgo…" /></div>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, borderTop: '1px solid var(--color-divider)', paddingTop: 14 }}>
          <button className="btn btn-secondary" onClick={() => go('plan')}>Cancelar</button>
          <button className="btn btn-primary" disabled={busy} onClick={submit}><Icon d="M20 6 9 17l-5-5" sw={1.8} />Guardar y generar Ticket</button>
        </div>
      </Card>
    </section>
  );
}
