import { NextResponse, NextRequest } from 'next/server';
import { checkRateLimit, rateLimitHeaders, clientIdFromHeaders } from '../../../../lib/rate-limit';

export const dynamic = 'force-dynamic';

type Ctx = { params: { path?: string[] } };

const UPSTREAM = process.env.API_UPSTREAM?.replace(/\/+$/, '');
const DEFAULT_ORIGINS = [
  'https://oneearlybird-v1master.vercel.app',
  'https://*.vercel.app',
  'https://oneearlybird.ai',
  'https://www.oneearlybird.ai',
  'https://oneearlybird.com',
  'https://www.oneearlybird.com',
];

const EXTRA_ORIGINS = (process.env.CORS_ALLOWLIST || '')
  .split(',')
  .map(s => s.trim())
  .filter(Boolean);

const ALLOWLIST = new Set([...DEFAULT_ORIGINS, ...EXTRA_ORIGINS]);

function corsHeaders(req: NextRequest) {
  const origin = req.headers.get('origin') || '';
  const allowed = [...ALLOWLIST].some(pat => {
    if (pat.includes('*')) {
      const re = new RegExp('^' + pat.replace(/\./g, '\\.').replace(/\*/g, '.*') + '$');
      return re.test(origin);
    }
    return origin === pat;
  });
  const h: Record<string, string> = {
    'Vary': 'Origin',
  };
  if (allowed) {
    h['Access-Control-Allow-Origin'] = origin;
    h['Access-Control-Allow-Credentials'] = 'true';
  }
  h['Access-Control-Allow-Methods'] = 'GET,POST,PUT,PATCH,DELETE,OPTIONS';
  h['Access-Control-Allow-Headers'] = 'Content-Type, Authorization';
  return { headers: h, allowed };
}

function json(body: any, init: ResponseInit = {}) {
  const h = new Headers(init.headers);
  h.set('Content-Type', 'application/json; charset=utf-8');
  return new NextResponse(JSON.stringify(body), { ...init, headers: h });
}

export async function OPTIONS(req: NextRequest) {
  const { headers } = corsHeaders(req);
  return new NextResponse(null, { status: 204, headers });
}

async function handle(req: NextRequest, ctx: Ctx) {
  // CORS
  const { headers: cors, allowed } = corsHeaders(req);
  if (!allowed) {
    return json({ ok: false, error: 'CORS origin not allowed' }, { status: 403, headers: cors });
  }

  // Rate limit
  const cid = clientIdFromHeaders(req.headers);
  const rl = await checkRateLimit(`upstream:${cid}`, "strict");
  const rlHeaders = rateLimitHeaders(rl);
  if (rl.limited) {
    return json({ ok: false, error: 'Too Many Requests' }, { status: 429, headers: { ...cors, ...rlHeaders } });
  }

  // Sanity checks
  if (!UPSTREAM) {
    return json({ ok: false, error: 'API_UPSTREAM not configured' }, { status: 503, headers: { ...cors, ...rlHeaders } });
  }

  const url = new URL(req.url);
  const joinedPath = (ctx.params.path || []).join('/');
  const target = `${UPSTREAM}/${joinedPath}${url.search}`;

  // Prepare upstream request
  const headers = new Headers(req.headers);
  headers.delete('host');
  headers.set('x-forwarded-by', 'earlybird-vercel-proxy');

  const init: RequestInit = {
    method: req.method,
    headers,
    body: ['GET', 'HEAD', 'OPTIONS'].includes(req.method) ? undefined : await req.arrayBuffer(),
    redirect: 'manual',
  };

  const resp = await fetch(target, init);

  // Forward response with safety headers + CORS + rate limit info
  const forwardedHeaders = new Headers(resp.headers);
  forwardedHeaders.delete('set-cookie');

  for (const [k, v] of Object.entries(cors)) {
    if (v) forwardedHeaders.set(k, v);
  }
  for (const [k, v] of Object.entries(rlHeaders)) {
    if (v) forwardedHeaders.set(k, v);
  }
  forwardedHeaders.set('x-upstream-proxy', 'earlybird');

  return new NextResponse(resp.body, {
    status: resp.status,
    statusText: resp.statusText,
    headers: forwardedHeaders,
  });
}

export async function GET(req: NextRequest, ctx: Ctx)    { return handle(req, ctx); }
export async function POST(req: NextRequest, ctx: Ctx)   { return handle(req, ctx); }
export async function PUT(req: NextRequest, ctx: Ctx)    { return handle(req, ctx); }
export async function PATCH(req: NextRequest, ctx: Ctx)  { return handle(req, ctx); }
export async function DELETE(req: NextRequest, ctx: Ctx) { return handle(req, ctx); }
