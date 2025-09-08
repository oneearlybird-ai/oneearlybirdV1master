export const runtime = 'nodejs';
import { neon } from '@neondatabase/serverless';

const sql = neon(String(process.env.DATABASE_URL || ''));

export async function GET() {
  try {
    if (!process.env.DATABASE_URL) {
      return Response.json({ ok:false, error:'missing_DATABASE_URL' }, { status:500 });
    }
    if (process.env.DEBUG_DB === '1') {
      try {
        const host = new URL(String(process.env.DATABASE_URL)).host;
        console.log('[db] host=%s', host);
      } catch {}
    }
    const rows = await sql`select now() as now`;
    return Response.json({ ok:true, time: rows[0].now });
  } catch (e) {
    if (process.env.DEBUG_DB === '1') {
      const msg = (e && (e as any).message) ? String((e as any).message).slice(0,200) : 'unknown';
      // Masked diagnostic; no secrets
      console.log('[db] connect err=%s', msg);
    }
    return Response.json({ ok:false, error:'db_unavailable' }, { status:503 });
  }
}
