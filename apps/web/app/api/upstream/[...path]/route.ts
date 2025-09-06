import { NextResponse, NextRequest } from 'next/server';

type Ctx = { params: { path?: string[] } };

const UPSTREAM = process.env.API_UPSTREAM?.replace(/\/+$/, '');

function joinPath(p?: string[] | string): string {
  if (!p) return '';
  if (Array.isArray(p)) return p.join('/');
  return String(p);
}

// Small JSON helper
function json(body: unknown, status = 200, extra?: HeadersInit) {
  return new NextResponse(JSON.stringify(body), {
    status,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'cache-control': 'no-store',
      ...extra,
    },
  });
}

async function handle(req: NextRequest, ctx: Ctx) {
  const joinedPath = joinPath(ctx.params?.path);

  // Local healthcheck that doesn't depend on upstream:
  if (joinedPath === 'ping') {
    return json(
      {
        ok: true,
        route: '/api/upstream/ping',
        upstream: UPSTREAM ?? null,
        ts: new Date().toISOString(),
      },
      200,
      { 'x-upstream-proxy': 'earlybird' },
    );
  }

  if (!UPSTREAM) {
    return json(
      { ok: false, error: 'API_UPSTREAM not configured' },
      503,
    );
  }

  const url = new URL(req.url);
  const target = `${UPSTREAM}/${joinedPath}${url.search || ''}`;

  // Clone headers and strip/annotate a few
  const headers = new Headers(req.headers);
  headers.delete('host');
  headers.set('x-forwarded-by', 'earlybird-vercel-proxy');

  const init: RequestInit = {
    method: req.method,
    headers,
    body: ['GET', 'HEAD'].includes(req.method) ? undefined : await req.arrayBuffer(),
    redirect: 'manual',
  };

  const resp = await fetch(target, init);

  // Forward response back (without leaking upstream cookies)
  const forwardedHeaders = new Headers(resp.headers);
  forwardedHeaders.delete('set-cookie');

  return new NextResponse(resp.body, {
    status: resp.status,
    statusText: resp.statusText,
    headers: forwardedHeaders,
  });
}

// Explicit method exports
export async function GET(req: NextRequest, ctx: Ctx)    { return handle(req, ctx); }
export async function POST(req: NextRequest, ctx: Ctx)   { return handle(req, ctx); }
export async function PUT(req: NextRequest, ctx: Ctx)    { return handle(req, ctx); }
export async function PATCH(req: NextRequest, ctx: Ctx)  { return handle(req, ctx); }
export async function DELETE(req: NextRequest, ctx: Ctx) { return handle(req, ctx); }
export async function OPTIONS() { return json({ ok: true }); }
