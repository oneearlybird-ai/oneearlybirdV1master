import { NextResponse } from 'next/server';

const UPSTREAM = process.env.API_UPSTREAM;

export const dynamic = 'force-dynamic';

export async function GET() {
  const checks: Array<{ name: string; url: string; ok: boolean; status: number; error?: string }> = [];

  // Upstream API /health via direct URL (bypasses proxy for clarity)
  if (!UPSTREAM) {
    return NextResponse.json(
      { ok: false, error: 'API_UPSTREAM not configured', checks: [] },
      { status: 503 },
    );
  }

  const directUrl = `${UPSTREAM.replace(/\/+$/, '')}/health`;
  try {
    const r = await fetch(directUrl, { cache: 'no-store' });
    checks.push({ name: 'upstream-direct', url: directUrl, ok: r.ok, status: r.status });
  } catch (e: any) {
    checks.push({ name: 'upstream-direct', url: directUrl, ok: false, status: 0, error: e?.message || String(e) });
  }

  // Upstream API /health through the Vercel proxy
  const proxiedUrl = `${process.env.NEXT_PUBLIC_API_URL ? '/api/upstream/health' : '/api/upstream/health'}`;
  try {
    const r = await fetch(new URL(proxiedUrl, 'http://localhost').toString().replace('http://localhost',''), { cache: 'no-store' });
    checks.push({ name: 'upstream-via-proxy', url: '/api/upstream/health', ok: r.ok, status: r.status });
  } catch (e: any) {
    checks.push({ name: 'upstream-via-proxy', url: '/api/upstream/health', ok: false, status: 0, error: e?.message || String(e) });
  }

  const ok = checks.every(c => c.ok);
  return NextResponse.json({ ok, checks, ts: Date.now() }, { status: ok ? 200 : 503 });
}
