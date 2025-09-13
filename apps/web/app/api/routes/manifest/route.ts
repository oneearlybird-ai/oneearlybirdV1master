export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

type Status = 'stable' | 'present' | 'pending';
type RouteEntry = { method: 'GET'|'POST'|'PUT'|'DELETE'|'PATCH'; path: string; status: Status };

const routes: RouteEntry[] = [
  { method: 'GET',  path: '/api/routes/manifest',              status: 'stable' },
  { method: 'GET',  path: '/api/status',                       status: 'stable' },
  { method: 'GET',  path: '/api/usage/summary',                status: 'stable' },
  { method: 'POST', path: '/api/stripe/webhook',               status: 'stable' },
  { method: 'POST', path: '/api/storage/presign',              status: 'stable' },
  { method: 'GET',  path: '/api/ratelimit-test',               status: 'stable' },

  { method: 'POST', path: '/api/voice/incoming',               status: 'present' },
  { method: 'POST', path: '/api/voice/status',                 status: 'present' },
  { method: 'POST', path: '/api/voice/recording',              status: 'present' },

  { method: 'POST', path: '/api/tools/*',                      status: 'present' },
  { method: 'POST', path: '/api/kb/search',                    status: 'present' },
  { method: 'POST', path: '/api/kb/doc',                       status: 'present' },
  { method: 'GET',  path: '/api/calls/list',                   status: 'present' },
  { method: 'GET',  path: '/api/recordings/item',              status: 'present' },

  { method: 'GET',  path: '/api/stripe/usage',                 status: 'present' },
  { method: 'POST', path: '/api/billing/portal',               status: 'present' },

  { method: 'GET',  path: '/api/integrations/oauth/start',     status: 'present' },
  { method: 'GET',  path: '/api/integrations/status',          status: 'present' },
  { method: 'POST', path: '/api/numbers/buy',                  status: 'present' },
  { method: 'POST', path: '/api/numbers/webhook',              status: 'present' }
 ,{ method: 'GET',  path: '/api/recordings/list',              status: 'present' }
];

export async function GET() {
  // Always a deterministic order for stable diffs
  const body = { routes: routes.slice().sort((a,b) => a.path.localeCompare(b.path)) };
  return new Response(JSON.stringify(body), {
    status: 200,
    headers: { 'content-type': 'application/json; charset=utf-8' }
  });
}
