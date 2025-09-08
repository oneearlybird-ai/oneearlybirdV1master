import { pgPool } from '@/lib/backend/db';
import type { NextRequest } from 'next/server';

export const runtime = 'nodejs';

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const orgId = url.searchParams.get('orgId');
  const hasOrg = !!orgId && /^[0-9a-fA-F-]{8}-[0-9a-fA-F-]{4}-[0-9a-fA-F-]{4}-[0-9a-fA-F-]{4}-[0-9a-fA-F-]{12}$/.test(orgId!);

  const pool = pgPool();
  const { rows } = await pool.query(
    `SELECT kind, COALESCE(SUM(qty),0)::bigint AS total
     FROM usage_events
     WHERE ($1::uuid IS NULL OR org_id = $1::uuid)
     GROUP BY kind
     ORDER BY kind`,
    [hasOrg ? orgId : null]
  );

  const totals: Record<string, number> = {};
  for (const r of rows) totals[r.kind] = Number(r.total);

  return Response.json({
    ok: true,
    orgId: hasOrg ? orgId : null,
    totals,
    updatedAt: new Date().toISOString()
  });
}
