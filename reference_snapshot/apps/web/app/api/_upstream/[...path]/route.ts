import { NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const UPSTREAM = process.env.API_UPSTREAM?.replace(/\/+$/, '');

export async function GET(req: Request, ctx: { params: { path: string[] } }) { return handle(req, ctx); }
export async function POST(req: Request, ctx: { params: { path: string[] } }) { return handle(req, ctx); }
export async function PUT(req: Request, ctx: { params: { path: string[] } }) { return handle(req, ctx); }
export async function PATCH(req: Request, ctx: { params: { path: string[] } }) { return handle(req, ctx); }
export async function DELETE(req: Request, ctx: { params: { path: string[] } }) { return handle(req, ctx); }

async function handle(req: Request, ctx: { params: { path: string[] } }) {
  if (!UPSTREAM) {
    return NextResponse.json(
      { ok: false, error: 'API_UPSTREAM not configured' },
      { status: 503, headers: noCacheHeaders() },
    );
  }

  const url = new URL(req.url);
  const path = ctx.params.path?.join('/') ?? '';
  const target = `${UPSTREAM}/${path}${url.search}`;

  const headers = new Headers(req.headers);
  headers.delete('host');
  headers.set('x-forwarded-by', 'earlybird-vercel-proxy');

  const init: RequestInit = {
    method: req.method,
    headers,
    body: ['GET', 'HEAD'].includes(req.method) ? undefined : await req.arrayBuffer(),
  };

  const resp = await fetch(target, init);

  const forwardedHeaders = new Headers(resp.headers);
  forwardedHeaders.delete('set-cookie');
  for (const [k, v] of Object.entries(noCacheHeaders())) {
    forwardedHeaders.set(k, v);
  }

  return new NextResponse(resp.body, {
    status: resp.status,
    statusText: resp.statusText,
    headers: forwardedHeaders,
  });
}

function noCacheHeaders() {
  return {
    'cache-control': 'private, no-cache, no-store, max-age=0, must-revalidate',
    'pragma': 'no-cache',
    'x-content-type-options': 'nosniff',
  };
}
