import { NextResponse } from 'next/server';

export async function GET() {
  const upstreamBase = process.env.API_UPSTREAM;
  const out: any = { ok: true, upstream: { configured: !!upstreamBase } };

  if (upstreamBase) {
    try {
      const ctrl = new AbortController();
      const to = setTimeout(() => ctrl.abort(), 4000);
      const base = upstreamBase.replace(/\/+$/, '');
      const r = await fetch(`${base}/health`, { signal: ctrl.signal });
      clearTimeout(to);

      out.upstream.status = r.status;
      out.upstream.ok = r.ok;
      out.upstream.contentType = r.headers.get('content-type') || null;
      try {
        out.upstream.body = await r.json();
      } catch {
        out.upstream.body = await r.text();
      }
    } catch (e: any) {
      out.ok = false;
      out.upstream.error = e?.name === 'AbortError' ? 'timeout' : (e?.message || 'fetch_failed');
    }
  } else {
    out.ok = false;
    out.error = 'API_UPSTREAM not set';
  }

  return NextResponse.json(out, { status: out.ok ? 200 : 503 });
}
