export const runtime = 'nodejs';
import { neon } from '@neondatabase/serverless';

const DSN = String(process.env.DATABASE_URL || '');
const sql = neon(DSN);

/**
 * GET /api/usage/summary
 * - Healthy path: one lightweight query to prove DB reachability
 * - Debug: send header `x-debug-db: 1` to print masked info (host + short error code/msg) to Vercel logs
 */
export async function GET(req: Request) {
  const dbg = req.headers.get('x-debug-db') === '1';
  try {
    if (!DSN) {
      if (dbg) console.log('[db] missing DATABASE_URL');
      return Response.json({ ok: false, error: 'missing_DATABASE_URL' }, { status: 500 });
    }
    if (dbg) {
      try { console.log('[db] host=%s', new URL(DSN).host); } catch {}
    }

    const rows = await sql`select now() as now`;
    return Response.json({ ok: true, time: rows[0].now });
  } catch (e: any) {
    if (dbg) {
      const code = e?.code ? String(e.code) : '';
      const msg  = e?.message ? String(e.message).slice(0,180) : 'unknown';
      console.log('[db] connect err code=%s msg=%s', code, msg);
    }
    return Response.json({ ok: false, error: 'db_unavailable' }, { status: 503 });
  }
}
