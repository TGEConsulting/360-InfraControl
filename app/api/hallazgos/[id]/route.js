import { NextResponse } from 'next/server';
import sql, { toClient } from '@/lib/db';

const PRIOS = ['Alta', 'Media', 'Baja'];
const ESTATUS = ['Abierto', 'En proceso', 'Pendiente verificación', 'Cerrado'];

// PATCH parcial: prio, estatus, checklist, comments, validacion
export async function PATCH(req, { params }) {
  const b = await req.json();
  if (b.prio && !PRIOS.includes(b.prio)) return NextResponse.json({ error: 'prio inválida' }, { status: 400 });
  if (b.estatus && !ESTATUS.includes(b.estatus)) return NextResponse.json({ error: 'estatus inválido' }, { status: 400 });
  const rows = await sql`UPDATE hallazgos SET
    prio = COALESCE(${b.prio ?? null}, prio),
    estatus = COALESCE(${b.estatus ?? null}, estatus),
    checklist = COALESCE(${b.checklist ? JSON.stringify(b.checklist) : null}::jsonb, checklist),
    comments = COALESCE(${b.comments ? JSON.stringify(b.comments) : null}::jsonb, comments),
    validacion = COALESCE(${b.validacion ? JSON.stringify(b.validacion) : null}::jsonb, validacion)
    WHERE id = ${params.id} RETURNING *`;
  if (!rows.length) return NextResponse.json({ error: 'no encontrado' }, { status: 404 });
  return NextResponse.json(toClient(rows[0]));
}
