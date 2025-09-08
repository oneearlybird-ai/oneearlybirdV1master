export const runtime = 'nodejs';
import { sql } from '@vercel/postgres';

export async function GET(req: Request) {
  const dbg = req.headers.get('x-debug-db') === '1';
  try {
    const { rows } = await sql`select now() as now`;
    return Response.json({ ok: true, time: rows[0].now });
  } catch (e: any) {
    if (dbg) {
      const msg = e?.message ? String(e.message).slice(0,180) : 'unknown';
      console.log('[db] vercel-postgres err=%s', msg);
    }
    return Response.json({ ok:false, error:'db_unavailable' }, { status:503 });
  }
}
