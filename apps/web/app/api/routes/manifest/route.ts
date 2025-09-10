export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

type RouteEntry = { method: string; path: string; status: 'stable'|'present'|'pending' };
const routes: RouteEntry[] = [
  { method: 'GET',  path: '/api/routes/manifest',  status: 'stable' },
  { method: 'GET',  path: '/api/status',           status: 'stable' },
  { method: 'GET',  path: '/api/usage/summary',    status: 'stable' },
  { method: 'POST', path: '/api/stripe/webhook',   status: 'stable' },
  { method: 'POST', path: '/api/storage/presign',  status: 'stable' },
  { method: 'GET',  path: '/api/ratelimit-test',   status: 'stable' },
  { method: 'POST', path: '/api/voice/incoming',   status: 'present' },
  { method: 'POST', path: '/api/voice/status',     status: 'present' },
  { method: 'POST', path: '/api/voice/recording',  status: 'present' },
  { method: 'POST', path: '/api/tools/*',          status: 'present' },
  { method: 'POST', path: '/api/kb/search',        status: 'present' },
  { method: 'POST', path: '/api/kb/doc',           status: 'present' },
  { method: 'GET',  path: '/api/stripe/usage',     status: 'present' },
  { method: 'POST', path: '/api/billing/portal',   status: 'present' },
  { method: 'GET',  path: '/api/integrations/oauth/start', status: 'present' },
  { method: 'POST', path: '/api/numbers/buy',      status: 'present' },
  { method: 'POST', path: '/api/numbers/webhook',  status: 'present' }
];

export async function GET() {
  return new Response(JSON.stringify({ routes }), {
    status: 200,
    headers: { 'content-type': 'application/json; charset=utf-8' }
  });
}
