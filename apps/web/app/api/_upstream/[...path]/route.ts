import { NextResponse } from 'next/server';

const UPSTREAM = process.env.API_UPSTREAM?.replace(/\/+$/, '');

async function handle(req: Request, { params }: { params: { path: string[] } }) {
  if (!UPSTREAM) {
    return NextResponse.json({ ok: false, error: 'API_UPSTREAM not configured' }, { status: 503 });
  }

  const url = new URL(req.url);
  const target = `${UPSTREAM}/${(params.path || []).join('/')}${url.search}`;

  const headers = new Headers(req.headers);
  headers.delete('host');
  headers.set('x-forwarded-by', 'earlybird-vercel-proxy');

  const init: RequestInit = {
    method: req.method,
    headers,
    body: (req.method === 'GET' || req.method === 'HEAD') ? undefined : await req.arrayBuffer(),
  };

  const resp = await fetch(target, init);

  const forwardedHeaders = new Headers(resp.headers);
  forwardedHeaders.delete('set-cookie');

  return new NextResponse(resp.body, {
    status: resp.status,
    statusText: resp.statusText,
    headers: forwardedHeaders,
  });
}

export { handle as GET, handle as POST, handle as PUT, handle as PATCH, handle as DELETE };
