import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

const UPSTREAM = process.env.API_UPSTREAM?.replace(/\/+$/, '');

export async function GET(req: Request) {
  const checks: Array<{ name: string; url: string; ok: boolean; status: number; error?: string }> = [];

  if (!UPSTREAM) {
    return NextResponse.json(
      { ok: false, error: 'API_UPSTREAM not configured', checks: [] },
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

  // 2) Via our Vercel proxy /api/upstream/health — needs absolute URL on the server
  const proto = req.headers.get('x-forwarded-proto') ?? 'https';
  const host = req.headers.get('x-forwarded-host') ?? req.headers.get('host') ?? '';
  const origin = `${proto}://${host}`;
  const proxiedAbs = `${origin}/api/upstream/health`;

  try {
    const r = await fetch(proxiedAbs, { cache: 'no-store' });
    checks.push({ name: 'upstream-via-proxy', url: '/api/upstream/health', ok: r.ok, status: r.status });
  } catch (e: any) {
    checks.push({ name: 'upstream-via-proxy', url: '/api/upstream/health', ok: false, status: 0, error: e?.message || String(e) });
  }

  const ok = checks.every(c => c.ok);
  return NextResponse.json({ ok, checks, ts: Date.now() }, { status: ok ? 200 : 503 });
}
