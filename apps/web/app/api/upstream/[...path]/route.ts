import { NextResponse } from 'next/server';

const UPSTREAM = process.env.API_UPSTREAM?.replace(/\/+$/, '');

async function handle(req: Request, ctx: { params: { path?: string[] } }) {
  if (!UPSTREAM) {
    return NextResponse.json({ ok: false, error: 'API_UPSTREAM not configured' }, { status: 503 });
  }

  const url = new URL(req.url);
  const subpath = (ctx.params.path ?? []).join('/');
  const target = `${UPSTREAM}/${subpath}${url.search}`;

  const headers = new Headers(req.headers);
  headers.delete('host');
  headers.set('x-forwarded-by', 'earlybird-vercel-proxy');

  const init: RequestInit = {
    method: req.method,
    headers,
    body: ['GET','HEAD'].includes(req.method) ? undefined : await req.arrayBuffer(),
  };

  const resp = await fetch(target, init);
  const outHeaders = new Headers(resp.headers);
  outHeaders.delete('set-cookie');

  return new NextResponse(resp.body, {
    status: resp.status,
    statusText: resp.statusText,
    headers: outHeaders,
  });
}

export async function GET(req: Request, ctx: { params: { path?: string[] } }) { return handle(req, ctx); }
export async function POST(req: Request, ctx: { params: { path?: string[] } }) { return handle(req, ctx); }
export async function PUT(req: Request, ctx: { params: { path?: string[] } }) { return handle(req, ctx); }
export async function PATCH(req: Request, ctx: { params: { path?: string[] } }) { return handle(req, ctx); }
export async function DELETE(req: Request, ctx: { params: { path?: string[] } }) { return handle(req, ctx); }
