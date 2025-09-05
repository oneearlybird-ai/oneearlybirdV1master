export const dynamic = 'force-dynamic';
export const runtime = 'edge';

import { NextResponse } from 'next/server';

const UPSTREAM = process.env.API_UPSTREAM?.replace(/\/+$/, '');
const ALLOWED_METHODS = new Set(['GET','POST','PUT','PATCH','DELETE','HEAD','OPTIONS']);
const HOP_BY_HOP = [
  'connection','keep-alive','proxy-authenticate','proxy-authorization',
  'te','trailer','transfer-encoding','upgrade','host','upgrade-insecure-requests'
];

async function handle(req: Request, { params }: { params: { path?: string[] } }) {
  try {
    if (!UPSTREAM) {
      return NextResponse.json({ ok: false, error: 'API_UPSTREAM not configured' }, { status: 503 });
    }
    if (!ALLOWED_METHODS.has(req.method)) {
      return NextResponse.json({ ok: false, error: 'Method not allowed' }, { status: 405 });
    }

    const incomingUrl = new URL(req.url);
    const path = (params?.path ?? []).join('/');
    const target = `${UPSTREAM}/${path}${incomingUrl.search}`;

    // Clone & sanitize headers for the upstream request
    const fwdReqHeaders = new Headers(req.headers);
    for (const h of HOP_BY_HOP) fwdReqHeaders.delete(h);
    fwdReqHeaders.set('x-forwarded-by', 'earlybird-vercel-proxy');

    const init: RequestInit = {
      method: req.method,
      headers: fwdReqHeaders,
      // Only include a body for methods that can have one
      body: (req.method === 'GET' || req.method === 'HEAD') ? undefined : await req.arrayBuffer(),
      // Avoid caches between edge ↔ upstream
      cache: 'no-store',
      redirect: 'manual',
      signal: undefined,
    };

    // Abort after 25s to prevent hanging builds/requests
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 25_000);
    init.signal = controller.signal;

    const resp = await fetch(target, init).finally(() => clearTimeout(timeout));

    // Sanitize response headers before returning to client
    const outHeaders = new Headers(resp.headers);
    outHeaders.delete('set-cookie'); // never forward upstream cookies through the proxy
    for (const h of HOP_BY_HOP) outHeaders.delete(h);

    return new NextResponse(resp.body, {
      status: resp.status,
      statusText: resp.statusText,
      headers: outHeaders,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Upstream request failed';
    return NextResponse.json({ ok: false, error: message }, { status: 502 });
  }
}

export { handle as GET, handle as POST, handle as PUT, handle as PATCH, handle as DELETE, handle as HEAD, handle as OPTIONS };
