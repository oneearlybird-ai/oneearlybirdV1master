type StoreResult = { remaining: number; reset: number; limited: boolean };

const WINDOW_SEC = parseInt(process.env.RATE_LIMIT_WINDOW_SEC || "60", 10);
const MAX_REQUESTS = parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || "60", 10);

const UPSTASH_URL = process.env.UPSTASH_REDIS_REST_URL;
const UPSTASH_TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN;

// In-memory fallback (per instance)
const mem = (globalThis as any).__eb_rate__ || new Map<string, { count: number; reset: number }>();
(globalThis as any).__eb_rate__ = mem;

async function upstashIncr(key: string, windowSec: number): Promise<StoreResult | null> {
  if (!UPSTASH_URL || !UPSTASH_TOKEN) return null;
  const now = Math.floor(Date.now() / 1000);
  const windowKey = `rl:${key}:${Math.floor(now / windowSec)}`;

  const resp = await fetch(`${UPSTASH_URL}/pipeline`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${UPSTASH_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      pipeline: [
        ["INCR", windowKey],
        ["EXPIRE", windowKey, String(windowSec)],
        ["PTTL", windowKey],
      ],
    }),
    cache: "no-store",
  });

  if (!resp.ok) throw new Error(`Upstash error: ${resp.status}`);
  const data = await resp.json();
  const count = Number(data?.result?.[0]);
  const pttl = Number(data?.result?.[2]);
  const reset = now + Math.max(1, Math.ceil(pttl / 1000));
  const limited = count > MAX_REQUESTS;
  return { remaining: Math.max(0, MAX_REQUESTS - count), reset, limited };
}

function memIncr(key: string, windowSec: number): StoreResult {
  const now = Math.floor(Date.now() / 1000);
  let entry = mem.get(key) as { count: number; reset: number } | undefined;
  if (!entry || entry.reset <= now) {
    entry = { count: 0, reset: now + windowSec };
  }
  entry.count += 1;
  mem.set(key, entry);
  const limited = entry.count > MAX_REQUESTS;
  return { remaining: Math.max(0, MAX_REQUESTS - entry.count), reset: entry.reset, limited };
}

export async function checkRateLimit(id: string) {
  const storeRes = await upstashIncr(id, WINDOW_SEC);
  return storeRes ?? memIncr(id, WINDOW_SEC);
}

export function rateLimitHeaders(res: StoreResult) {
  return {
    "RateLimit-Limit": String(MAX_REQUESTS),
    "RateLimit-Remaining": String(res.remaining),
    "RateLimit-Reset": String(res.reset),
    "Retry-After": res.limited ? String(Math.max(1, res.reset - Math.floor(Date.now() / 1000))) : undefined,
  };
}

export function clientIdFromHeaders(h: Headers) {
  const xf = h.get("x-forwarded-for") || "";
  const ip = xf.split(",")[0].trim() ||
             h.get("x-real-ip") ||
             h.get("cf-connecting-ip") ||
             "anon";
  const ua = h.get("user-agent") || "ua";
  return `${ip}:${ua.slice(0,64)}`;
}
