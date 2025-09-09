export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

async function handle() {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  const headers = { 'content-type': 'application/json' } as const;
  if (!url || !token) {
    return new Response(JSON.stringify({ ok: true, state: 'disabled' }), { status: 200, headers });
  }
  const key = 'ratelimit:smoke';
  const resp = await fetch(`${url}/pipeline`, {
    method: 'POST',
    headers: { authorization: `Bearer ${token}`, 'content-type': 'application/json' },
    body: JSON.stringify([["INCR", key], ["EXPIRE", key, 60]]),
    cache: 'no-store',
  });
  const raw = (await resp.json().catch(() => null)) as unknown;
  let count = 0;
  if (Array.isArray(raw)) {
    const first = (raw as Array<Record<string, unknown>>)[0];
    const r = first?.result;
    count = typeof r === 'number' ? r : Number(r ?? 0);
  }
  if (Number.isFinite(count) && count > 1) {
    return new Response(JSON.stringify({ ok: false, limited: true, count }), { status: 429, headers });
  }
  return new Response(JSON.stringify({ ok: true, limited: false, count }), { status: 200, headers });
}

export async function GET() { return handle(); }
export async function POST() { return handle(); }

