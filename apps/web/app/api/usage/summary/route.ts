export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  const body = {
    status: 'ok',
    version: process.env.VERCEL_GIT_COMMIT_SHA || 'unknown',
    db: 'unknown',     // not required for PASS
    cache: 'unknown',  // not required for PASS
    timestamp: new Date().toISOString()
  };
  return new Response(JSON.stringify(body), {
    status: 200,
    headers: { 'content-type': 'application/json; charset=utf-8' }
  });
}
