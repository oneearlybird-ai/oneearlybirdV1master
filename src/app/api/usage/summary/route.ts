export const runtime = 'nodejs';
import { neon } from '@neondatabase/serverless';

const sql = neon(String(process.env.DATABASE_URL || ''));

export async function GET() {
  try {
    if (!process.env.DATABASE_URL) {
      return Response.json({ ok:false, error:'missing_DATABASE_URL' }, { status:500 });
    }
    const rows = await sql`select now() as now`;
    return Response.json({ ok:true, time: rows[0].now });
  } catch (e) {
    return Response.json({ ok:false, error:'db_unavailable' }, { status:503 });
  }
}
