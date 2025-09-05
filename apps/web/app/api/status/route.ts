import { NextResponse } from 'next/server';

const UPSTREAM = process.env.API_UPSTREAM?.replace(/\/+$/, '');

export async function GET(req: Request) {
  const checks: any[] = [];

  if (!UPSTREAM) {
    return NextResponse.json(
      { ok: false, error: 'API_UPSTREAM not configured' },
      { status: 503 },
    );
  }

  // 1) Direct upstream /health
  const directUrl = `${UPSTREAM}/health`;
  try {
    const r = await fetch(directUrl, { cache: 'no-store' });
    checks.push({ name: 'upstream-direct', url: directUrl, ok: r.ok, status: r.status });
  } catch (e: any) {
    checks.push({ name: 'upstream-direct', url: directUrl, ok: false, status: 0, error: e?.message || String(e) });
  }

  // 2) Same-origin absolute call to our Vercel proxy
  const headers = req.headers;
  const proto = headers.get('x-forwarded-proto') ?? 'https';
  const host = headers.get('x-forwarded-host') ?? headers.get('host') ?? '';
  const origin = host ? `${proto}://${host}` : '';
  const proxiedAbs = origin ? `${origin}/api/upstream/health` : '/api/upstream/health';

  try {
    const r = await fetch(proxiedAbs, { cache: 'no-store' });
    checks.push({ name: 'upstream-via-proxy', url: '/api/upstream/health', ok: r.ok, status: r.status });
  } catch (e: any) {
    checks.push({ name: 'upstream-via-proxy', url: '/api/upstream/health', ok: false, status: 0, error: e?.message || String(e) });
  }

  const ok = checks.every(c => c.ok);
  return NextResponse.json({ ok, checks, ts: Date.now() }, { status: ok ? 200 : 503 });
}
