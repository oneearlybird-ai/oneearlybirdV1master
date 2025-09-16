export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// Safe demo dataset for preview UI — no PHI, no secrets.
export async function GET() {
  const body = {
    ok: true,
    plan: 'Pro',
    renewal: '2025-10-12',
    calls: 125,
    minutes: 600,
    quota: { calls: 500, minutes: 1000 },
    week: { answered: 58, booked: 12, deflected: 9, avgDuration: '3m 12s' },
    version: process.env.VERCEL_GIT_COMMIT_SHA || 'unknown',
    timestamp: new Date().toISOString(),
  };
  return new Response(JSON.stringify(body), {
    status: 200,
    headers: { 'content-type': 'application/json; charset=utf-8' },
  });
}

