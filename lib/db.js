import { neon } from '@neondatabase/serverless';
const sql = neon(process.env.DATABASE_URL);
export default sql;

export const toClient = (r) => ({
  id: r.id, folio: r.folio, fecha: r.fecha, origen: r.origen, reportadoPor: r.reportado_por,
  area: r.area, edificio: r.edificio, categoria: r.categoria, tipo: r.tipo, norma: r.norma,
  ejecutor: r.ejecutor, proveedor: r.proveedor, prio: r.prio, estatus: r.estatus,
  costoEst: r.costo_est, fechaProg: r.fecha_prog, obs: r.obs, accion: r.accion, desc: r.descr,
  checklist: r.checklist, comments: r.comments, validacion: r.validacion,
});

export const defChecklist = (done = 0) =>
  ['Material recibido', 'Área liberada', 'Trabajo realizado', 'Evidencia subida', 'Limpieza / sanitización', 'Validación de Inocuidad', 'Cierre de OT']
    .map((label, i) => ({ label, done: i < done }));

// Inserta una fila con folio consecutivo calculado en la propia consulta.
export async function insertHallazgo(h) {
  const rows = await sql`
    WITH n AS (SELECT COALESCE(MAX(num),0)+1 AS num FROM hallazgos)
    INSERT INTO hallazgos (num,id,folio,fecha,origen,reportado_por,area,edificio,categoria,tipo,norma,ejecutor,proveedor,prio,estatus,costo_est,fecha_prog,obs,accion,descr,checklist)
    SELECT n.num, 'INF-2026-'||lpad(n.num::text,6,'0'), 'HAL-2026-'||lpad(n.num::text,6,'0'),
      ${h.fecha||'—'},${h.origen||''},${h.reportadoPor||''},${h.area||''},${h.edificio||''},${h.categoria||''},${h.tipo||''},${h.norma||''},
      ${h.ejecutor||''},${h.proveedor||h.ejecutor||''},${['Alta','Media','Baja'].includes(h.prio)?h.prio:'Media'},
      ${['Abierto','En proceso','Pendiente verificación','Cerrado'].includes(h.estatus)?h.estatus:'Abierto'},
      ${h.costoEst||'No especificado'},${h.fechaProg||'—'},${h.obs||''},${h.accion||'—'},${h.desc||'(Sin descripción)'},${JSON.stringify(defChecklist(0))}::jsonb
    FROM n RETURNING *`;
  return toClient(rows[0]);
}
