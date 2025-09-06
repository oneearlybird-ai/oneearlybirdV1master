import { Redis } from "@upstash/redis";

type WindowOpts = {
  windowMs: number; // e.g., 60_000
  limit: number;    // e.g., 60
  prefix?: string;  // key namespace
};

type CheckResult = {
  allowed: boolean;
  remaining: number;
  limit: number;
  reset: number; // epoch seconds when window resets
  headers: Record<string, string>;
};

/**
 * Lazily create a single Upstash client for the process.
 * Uses REST URL + TOKEN provided by Vercel env.
 * Returns undefined if env not configured or constructor fails, so we can fall back.
 */
let redisSingleton: Redis | undefined;
function getRedis(): Redis | undefined {
  if (redisSingleton) return redisSingleton;
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return undefined;
  try {
    redisSingleton = new Redis({ url, token });
    return redisSingleton;
  } catch {
    return undefined;
  }
}

/**
 * In-memory fallback fixed-window buckets (per server instance).
 * Acceptable as a safety net; not distributed.
 */
const memBuckets = new Map<string, { count: number; resetAtMs: number }>();

async function checkWithRedis(key: string, o: WindowOpts): Promise<{ count: number; resetMs: number }> {
  const r = getRedis();
  if (!r) throw new Error("redis-not-configured");

  const now = Date.now();
  const windowStart = Math.floor(now / o.windowMs) * o.windowMs; // align windows
  const resetAtMs = windowStart + o.windowMs;
  const namespacedKey = `${o.prefix ?? "rl"}:${key}:${windowStart}`;

  // INCR and set TTL atomically enough for our use (REST is single op each)
  const count = (await r.incr(namespacedKey)) as number;
  if (count === 1) {
    // first hit in window, set expiry slightly beyond window end to tolerate latency
    const ttlSec = Math.ceil((o.windowMs + 1000) / 1000);
    await r.expire(namespacedKey, ttlSec);
  }
  return { count, resetMs: resetAtMs - now };
}

function checkWithMemory(key: string, o: WindowOpts): { count: number; resetMs: number } {
  const now = Date.now();
  const bucket = memBuckets.get(key);
  if (!bucket || now >= bucket.resetAtMs) {
    const resetAtMs = now + o.windowMs;
    memBuckets.set(key, { count: 1, resetAtMs });
    return { count: 1, resetMs: resetAtMs - now };
  }
  bucket.count += 1;
  return { count: bucket.count, resetMs: bucket.resetAtMs - now };
}

/**
 * Public: checkRateLimit
 * - Returns allow/deny + standardized headers (safe for exposure)
 */
export async function checkRateLimit(key: string, o: WindowOpts): Promise<CheckResult> {
  const nowMs = Date.now();
  let count = 0;
  let resetMs = o.windowMs;

  try {
    const t = await checkWithRedis(key, o);
    count = t.count;
    resetMs = t.resetMs;
  } catch {
    const t = checkWithMemory(key, o);
    count = t.count;
    resetMs = t.resetMs;
  }

  const allowed = count <= o.limit;
  const remaining = Math.max(0, o.limit - count);
  const reset = Math.floor((nowMs + resetMs) / 1000);

  return {
    allowed,
    remaining,
    limit: o.limit,
    reset,
    headers: rateLimitHeaders({ limit: o.limit, remaining, reset }),
  };
}

/**
 * Public: rateLimitHeaders
 * - Only standard, non-sensitive headers.
 */
export function rateLimitHeaders(d: { limit: number; remaining: number; reset: number }): Record<string, string> {
  const h: Record<string, string> = {
    "x-ratelimit-limit": String(d.limit),
    "x-ratelimit-remaining": String(d.remaining),
    "x-ratelimit-reset": String(d.reset),
  };
  if (d.remaining <= 0) {
    const now = Math.floor(Date.now() / 1000);
    const retry = Math.max(0, d.reset - now);
    h["retry-after"] = String(retry);
  }
  return h;
}

/**
 * Public: clientIdFromHeaders
 * - Derives a coarse, semi-stable identifier from IP + UA.
 * - Safe to expose; do not include secrets.
 */
export function clientIdFromHeaders(h: Headers) {
  const xf = h.get("x-forwarded-for") || "";
  const ip =
    xf.split(",")[0].trim() ||
    h.get("x-real-ip") ||
    h.get("cf-connecting-ip") ||
    "anon";
  const ua = h.get("user-agent") || "ua";
  return `${ip}:${ua.slice(0, 64)}`;
}
