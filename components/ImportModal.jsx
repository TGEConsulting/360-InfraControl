'use client';
import React from 'react';
import { Card, Kicker, Icon, Corners, mix, prioStyle } from './ui';

const IMPORT_MAP = [
  ['Fecha Reporte', 'Fecha'], ['Origen', 'Origen'], ['Reportado por', 'Reportado por'], ['Área', 'Área'], ['Edificio', 'Edificio'], ['Categoría', 'Categoría / Tipo'],
  ['Tipo', 'Elemento'], ['Hallazgo (Descripción Completa)', 'Hallazgo'], ['Evidencia Inicio', 'Evidencia inicio'], ['No Ticket', 'Ignorado — el sistema asigna folio', false],
  ['Ticket Tipo', 'Tipo de ticket'], ['Prioridad', 'Prioridad'], ['OT Asignada', 'Orden de Trabajo'], ['Acción Correctiva Recomendada', 'Acción correctiva'],
  ['Fecha Programada', 'Fecha programada'], ['Fecha Real Cierre', 'Fecha real de cierre'], ['Proveedor / Recurso', 'Proveedor / recurso'], ['Responsable', 'Responsable / ejecutor'],
  ['Costo Estimado ($)', 'Costo estimado'], ['Evidencia Cierre', 'Evidencia cierre'], ['Columna1', 'Ignorado', false], ['Estatus', 'Estatus'], ['Observaciones', 'Observaciones'],
].map(([excel, sistema, ok = true]) => ({ excel, sistema, ok }));

export function mapRow(o) {
  const g = (...keys) => { for (const k in o) { const nk = k.toLowerCase().replace(/\s+/g, ' ').trim(); if (keys.some((x) => nk.includes(x))) return o[k]; } return ''; };
  const norm = (v) => (v == null ? '' : String(v).trim());
  let prio = norm(g('prioridad')).toLowerCase(); prio = prio.startsWith('alt') ? 'Alta' : prio.startsWith('baj') ? 'Baja' : 'Media';
  let est = norm(g('estatus')).toLowerCase(); est = est.includes('cerr') ? 'Cerrado' : est.includes('proceso') ? 'En proceso' : est.includes('verific') || est.includes('pend') ? 'Pendiente verificación' : 'Abierto';
  return {
    fecha: norm(g('fecha reporte', 'fecha')) || '—', origen: norm(g('origen')) || 'Recorrido / AUI', reportadoPor: norm(g('reportado')) || 'Coordinador de Inocuidad',
    area: norm(g('área', 'area')) || 'Área General', edificio: norm(g('edificio')) || 'Nave 1', tipo: norm(g('categoría', 'categoria')) || 'Infraestructura', categoria: norm(g('tipo')) || 'Elemento',
    desc: norm(g('hallazgo', 'descripción', 'descripcion')) || '(Sin descripción)', prio, estatus: est, accion: norm(g('acción', 'accion', 'correctiva')) || '—',
    fechaProg: norm(g('programada')) || '—', proveedor: norm(g('proveedor', 'recurso')) || 'Mtto. interno', ejecutor: norm(g('responsable')) || 'Mtto. interno',
    obs: norm(g('observaciones')) || 'Importado desde Excel.', norma: 'ISO 22002-100:2025', costoEst: norm(g('costo')) || 'No especificado',
  };
}

const base = { norma: 'ISO 22002-100:2025', costoEst: 'No especificado', fechaProg: '—', estatus: 'Abierto', obs: 'Importado desde F02.xlsx.' };
const SAMPLE = [
  { ...base, fecha: '12 Jul 2026', origen: 'Recorrido / AUI', reportadoPor: 'Coordinador de Inocuidad', area: 'Envasado Aséptico', edificio: 'Nave 1', categoria: 'Pared', tipo: 'Infraestructura', prio: 'Alta', ejecutor: 'Póliza', proveedor: 'Póliza', accion: 'Resanar y repintar muro con pintura epóxica sanitaria.', desc: 'Pintura desprendida en muro junto a llenadora 2 — riesgo de partícula extraña sobre producto.' },
  { ...base, fecha: '12 Jul 2026', origen: 'Recorrido / AUI', reportadoPor: 'Coordinador de Seguridad e Higiene', area: 'Área de Crema', edificio: 'Nave 2', categoria: 'Drenaje/Coladera', tipo: 'Infraestructura', prio: 'Media', ejecutor: 'Mtto. interno', proveedor: 'Mtto. interno', accion: 'Colocar rejilla sanitaria y sellar contorno.', desc: 'Coladera sin rejilla en pasillo de crema — riesgo de ingreso de plaga y retorno de olores.' },
  { ...base, fecha: '13 Jul 2026', origen: 'Correo', reportadoPor: 'Jefe de SHE', area: 'Laboratorio', edificio: 'Oficinas Centrales', categoria: 'Luminaria', tipo: 'Servicio', prio: 'Baja', ejecutor: 'Mtto. interno', proveedor: 'Mtto. interno', norma: 'ISO 22102-1:2025', accion: 'Sustituir balastro y lámpara sobre mesa de análisis.', desc: 'Lámpara parpadeante sobre mesa de análisis del laboratorio de calidad.' },
  { ...base, fecha: '13 Jul 2026', origen: 'Recorrido / AUI', reportadoPor: 'Coordinador de Inocuidad', area: 'Pasteurización', edificio: 'Nave 1', categoria: 'Tubería de Vapor', tipo: 'Gas y Vapor', prio: 'Alta', ejecutor: 'Mtto. interno', proveedor: 'Mtto. interno', norma: 'NOM-251-SSA1-2009', accion: 'Reponer aislamiento térmico y sellar fuga.', desc: 'Aislamiento de tubería de vapor desprendido sobre línea de pasteurización con condensación visible.' },
];

export function ImportModal({ nextNum, onClose, onImport, flash }) {
  const [rows, setRows] = React.useState(null);
  const [fileName, setFileName] = React.useState('');
  const [busy, setBusy] = React.useState(false);
  const input = React.useRef(null);
  const pad = (n) => String(n).padStart(6, '0');

  const onFile = async (e) => {
    const file = e.target.files && e.target.files[0]; if (!file) return;
    try {
      const XLSX = await import('xlsx');
      const wb = XLSX.read(await file.arrayBuffer(), { type: 'array' });
      let best = [];
      wb.SheetNames.forEach((n) => { const j = XLSX.utils.sheet_to_json(wb.Sheets[n], { defval: '', raw: false }); if (j.length > best.length) best = j; });
      const parsed = best.map(mapRow).filter((r) => r.desc && r.desc !== '(Sin descripción)');
      if (!parsed.length) return flash('No se detectaron filas de hallazgos en el archivo');
      setRows(parsed); setFileName(file.name);
    } catch (err) { flash('No se pudo leer el archivo: ' + err.message); }
    e.target.value = '';
  };
  const doImport = async () => { setBusy(true); await onImport(rows); setBusy(false); };
  const subtle = mix(55);

  return (
    <div role="dialog" aria-modal="true" aria-label="Importar hallazgos desde Excel" style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'grid', placeItems: 'center', padding: 24, background: 'color-mix(in srgb,#0a0d10 55%,transparent)' }}>
      <div className="elev-lg" style={{ width: 'min(920px,100%)', maxHeight: '88vh', display: 'flex', flexDirection: 'column', background: 'var(--color-bg)', border: '1px solid var(--color-divider)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, padding: '16px 20px', borderBottom: '1px solid var(--color-divider)' }}>
          <div><h3 style={{ margin: 0 }}>Importar hallazgos desde Excel</h3><div style={{ fontSize: 12, color: subtle, marginTop: 2 }}>Formato PR-MAN-21-F02 · el sistema asigna folio consecutivo automáticamente</div></div>
          <button className="btn btn-secondary btn-icon" aria-label="Cerrar" onClick={onClose}><Icon d="M18 6 6 18M6 6l12 12" size={16} sw={1.7} /></button>
        </div>
        <div className="ic-scroll" style={{ flex: 1, overflowY: 'auto', padding: 20 }}>
          <input ref={input} type="file" accept=".xlsx,.xls,.csv" style={{ display: 'none' }} onChange={onFile} />
          {!rows ? (
            <div>
              <button className="blueprint ic-hover" onClick={() => input.current.click()} style={{ width: '100%', borderStyle: 'dashed', padding: 38, display: 'grid', placeItems: 'center', textAlign: 'center', cursor: 'pointer', background: 'transparent', color: 'inherit', font: 'inherit' }}>
                <Corners />
                <div style={{ color: mix(60) }}>
                  <Icon d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3" size={38} sw={1.3} style={{ margin: '0 auto 10px', color: 'var(--color-accent)' }} />
                  <div style={{ fontSize: 15, fontFamily: 'var(--font-heading)', fontWeight: 600, color: 'var(--color-text)' }}>Haz clic para seleccionar tu archivo .xlsx</div>
                  <div style={{ fontSize: 12.5, marginTop: 4 }}>Se leerá y mapeará contra las columnas del formato F02</div>
                </div>
              </button>
              <div style={{ textAlign: 'center', marginTop: 12 }}><button className="btn btn-ghost" style={{ fontSize: 12.5 }} onClick={() => { setRows(SAMPLE); setFileName('F02_ejemplo.xlsx'); }}>o usar datos de ejemplo (4 filas)</button></div>
              <div style={{ marginTop: 18 }}>
                <Kicker>Columnas esperadas del archivo</Kicker>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 8 }}>{IMPORT_MAP.map((m) => <span key={m.excel} className="tag tag-neutral">{m.excel}</span>)}</div>
              </div>
            </div>
          ) : (
            <div>
              <div className="blueprint" style={{ padding: '12px 14px', display: 'flex', alignItems: 'center', gap: 12, background: 'color-mix(in srgb,var(--color-accent) 8%,transparent)' }}>
                <Corners />
                <Icon d="M14 3v4a1 1 0 0 0 1 1h4M17 21H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h7l5 5v11a2 2 0 0 1-2 2z" size={20} style={{ color: 'var(--color-accent)' }} />
                <div style={{ flex: 1, fontSize: 13 }}><strong>{fileName}</strong> — se detectaron <strong>{rows.length}</strong> filas válidas. El sistema asignará folio consecutivo a partir de <strong style={{ color: 'var(--color-accent)' }}>HAL-2026-{pad(nextNum + 1)}</strong>.</div>
              </div>
              <div style={{ marginTop: 16 }}>
                <Kicker>Mapeo de columnas · Excel → sistema</Kicker>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px 20px', marginTop: 8 }}>
                  {IMPORT_MAP.map((m) => (
                    <div key={m.excel} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, padding: '3px 0', borderBottom: `1px solid ${mix(6)}` }}>
                      <span style={{ width: 7, height: 7, borderRadius: '50%', flex: 'none', background: m.ok ? 'var(--ok)' : mix(30) }} />
                      <span style={{ flex: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', color: mix(70) }}>{m.excel}</span>
                      <Icon d="M5 12h14M13 6l6 6-6 6" size={12} sw={1.7} style={{ flex: 'none', color: mix(40) }} />
                      <span style={{ flex: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', textAlign: 'right', color: m.ok ? undefined : mix(45) }}>{m.sistema}</span>
                    </div>
                  ))}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, padding: '3px 0', gridColumn: '1/-1', background: 'color-mix(in srgb,var(--color-accent) 8%,transparent)' }}>
                    <span style={{ width: 7, height: 7, borderRadius: '50%', flex: 'none', background: 'var(--color-accent)' }} />
                    <span style={{ flex: 1, color: mix(70) }}>Folio</span>
                    <span style={{ flex: 1, textAlign: 'right', color: 'var(--color-accent-700)', fontWeight: 600 }}>Generado por el sistema (consecutivo)</span>
                  </div>
                </div>
              </div>
              <div style={{ marginTop: 16 }}>
                <Kicker style={{ marginBottom: 8 }}>Vista previa</Kicker>
                <div className="blueprint" style={{ padding: 0 }}>
                  <Corners />
                  <div style={{ overflowX: 'auto' }}>
                    <table className="table" style={{ minWidth: 760 }}>
                      <thead><tr><th style={{ background: 'color-mix(in srgb,var(--color-accent) 12%,transparent)', color: 'var(--color-accent-700)' }}>Folio (sistema)</th><th>Fecha</th><th>Área / Edificio</th><th>Elemento</th><th style={{ minWidth: 260 }}>Hallazgo</th><th>Prioridad</th></tr></thead>
                      <tbody>
                        {rows.map((p, i) => (
                          <tr key={i}>
                            <td style={{ fontFamily: 'var(--font-heading)', fontWeight: 600, whiteSpace: 'nowrap', color: 'var(--color-accent)', background: 'color-mix(in srgb,var(--color-accent) 7%,transparent)' }}>INF-2026-{pad(nextNum + i + 1)}</td>
                            <td style={{ whiteSpace: 'nowrap', color: mix(65) }}>{p.fecha}</td>
                            <td style={{ whiteSpace: 'nowrap' }}><div>{p.area}</div><div style={{ fontSize: 11, color: subtle }}>{p.edificio}</div></td>
                            <td style={{ whiteSpace: 'nowrap' }}>{p.categoria}</td>
                            <td style={{ fontSize: 12.5, color: mix(80), maxWidth: 320 }}><div style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{p.desc}</div></td>
                            <td><span className="tag" style={prioStyle(p.prio)}>{p.prio}</span></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10, padding: '14px 20px', borderTop: '1px solid var(--color-divider)' }}>
          <span style={{ fontSize: 12, color: mix(50) }}>Cada fila importada crea Ticket y OT automáticamente (§Automatización)</span>
          <div style={{ display: 'flex', gap: 10 }}>
            <button className="btn btn-secondary" onClick={onClose}>Cancelar</button>
            {rows && <button className="btn btn-primary" disabled={busy} onClick={doImport}><Icon d="M20 6 9 17l-5-5" sw={1.8} />Importar {rows.length} hallazgos</button>}
          </div>
        </div>
      </div>
    </div>
  );
}
