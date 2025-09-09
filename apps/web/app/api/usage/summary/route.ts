export const runtime = 'nodejs';
import { neon } from '@neondatabase/serverless';

export async function GET(req: Request) {
  const dbg = req.headers.get('x-debug-db') === '1';
  const dsn = process.env.DATABASE_URL;
  if (!dsn) {
    if (dbg) console.log('[db] DATABASE_URL missing (skipping)');
    return Response.json({ ok: true, time: new Date().toISOString(), db: 'disabled' });
  }
  try {
    const sql = neon(dsn);
    const rows = await sql`select now() as now`;
    return Response.json({ ok: true, time: rows[0].now, db: 'ok' });
  } catch (e: any) {
    if (dbg) console.log('[db] neon err=%s', String(e?.message || 'unknown').slice(0,180));
    return Response.json({ ok: true, time: new Date().toISOString(), db: 'error' });
  }
}
