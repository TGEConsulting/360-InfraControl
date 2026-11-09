import { NextResponse } from 'next/server';
import sql, { toClient, insertHallazgo } from '@/lib/db';
export const dynamic = 'force-dynamic';

export async function GET() {
  const rows = await sql`SELECT * FROM hallazgos ORDER BY num`;
  return NextResponse.json(rows.map(toClient));
}

// POST { hallazgo } o { hallazgos: [...] } (importación)
export async function POST(req) {
  const body = await req.json();
  const list = Array.isArray(body.hallazgos) ? body.hallazgos : [body.hallazgo];
  const out = [];
  for (const h of list) out.push(await insertHallazgo(h));
  return NextResponse.json(out, { status: 201 });
}

// DELETE = restablecer datos demo (vuelve a los 7 originales)
export async function DELETE() {
  await sql`DELETE FROM hallazgos WHERE num > 7`;
  await sql`UPDATE hallazgos SET comments='[]'::jsonb, validacion='{"estado":"—","motivo":""}'::jsonb,
    prio=CASE num WHEN 1 THEN 'Alta' WHEN 2 THEN 'Alta' WHEN 3 THEN 'Media' WHEN 4 THEN 'Media' WHEN 5 THEN 'Alta' WHEN 6 THEN 'Media' ELSE 'Baja' END,
    estatus=CASE num WHEN 1 THEN 'En proceso' WHEN 2 THEN 'Cerrado' WHEN 3 THEN 'En proceso' WHEN 4 THEN 'Pendiente verificación' ELSE 'Abierto' END,
    checklist=(SELECT jsonb_agg(jsonb_build_object('label',x->>'label','done',(ord::int)<=CASE num WHEN 1 THEN 3 WHEN 2 THEN 7 WHEN 3 THEN 2 WHEN 4 THEN 5 ELSE 0 END) ORDER BY ord)
      FROM jsonb_array_elements(checklist) WITH ORDINALITY AS t(x,ord))`;
  const rows = await sql`SELECT * FROM hallazgos ORDER BY num`;
  return NextResponse.json(rows.map(toClient));
}
