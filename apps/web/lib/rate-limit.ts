/**
 * Robust, Edge-safe rate limiting with Redis (Upstash) primary + in-memory fallback.
 * Windowed fixed bucket: limit N requests per "windowSec" per client key.
 * Returns headers you can forward to help clients self-throttle.
 */

import { Redis } from "@upstash/redis";

type Result = {
  allowed: boolean;
  remaining: number;
  limit: number;
  reset: number; // epoch seconds when window resets
  headers: Record<string, string>;
};

type Opts = {
  windowSec: number;
  limit: number;
  now?: number;          // ms
  keyPrefix?: string;    // namespace
};

const DEFAULTS: Opts = {
  windowSec: 60,
  limit: 60,
  keyPrefix: "rl",
};

const url = process.env.UPSTASH_REDIS_REST_URL;
const token = process.env.UPSTASH_REDIS_REST_TOKEN;

let redis: Redis | null = null;
if (url && token) {
  try {
    redis = new Redis({ url, token });
  } catch {
    redis = null;
  }
}

// ——— In-memory fallback (per-region) ———
type MemEntry = { count: number; resetMs: number };
const memStore = new Map<string, MemEntry>();

function memTake(key: string, opts: Opts, nowMs: number) {
  const windowMs = opts.windowSec * 1000;
  const entry = memStore.get(key);
  if (!entry || nowMs >= entry.resetMs) {
    const resetMs = nowMs + windowMs;
    memStore.set(key, { count: 1, resetMs });
    return { count: 1, resetMs };
  } else {
    entry.count += 1;
    return { count: entry.count, resetMs: entry.resetMs };
  }
}

// ——— Redis fixed-window counter ———
// Key shape: {prefix}:{bucket}:{clientKey}, bucket = Math.floor(now/windowSec)
async function redisTake(
  r: Redis,
  key: string,
  opts: Opts,
  nowMs: number
): Promise<{ count: number; resetMs: number }> {
  const windowSec = opts.windowSec;
  const bucket = Math.floor(nowMs / 1000 / windowSec);
  const base = `${opts.keyPrefix || DEFAULTS.keyPrefix}:${windowSec}`;
  const redisKey = `${base}:${bucket}:${key}`;

  // INCR and set expiry if first hit
  const count = await r.incr(redisKey);
  if (count === 1) {
    await r.expire(redisKey, windowSec);
  }

  const bucketEndSec = (bucket + 1) * windowSec;
  const resetMs = bucketEndSec * 1000;
  return { count, resetMs };
}

/**
 * take:
 * - key: stable client identifier (e.g., ip:ua)
 * - opts: windowSec + limit
 */
export async function take(key: string, opts?: Partial<Opts>): Promise<Result> {
  const o: Opts = { ...DEFAULTS, ...(opts || {}) };
  const nowMs = Math.floor(o.now ?? Date.now());

  let count: number;
  let resetMs: number;

  if (redis) {
    try {
      const t = await redisTake(redis, key, o, nowMs);
      count = t.count;
      resetMs = t.resetMs;
    } catch {
      const t = memTake(key, o, nowMs);
      count = t.count;
      resetMs = t.resetMs;
    }
  } else {
    const t = memTake(key, o, nowMs);
    count = t.count;
    resetMs = t.resetMs;
  }

  const allowed = count <= o.limit;
  const remaining = Math.max(0, o.limit - count);
  const reset = Math.floor(resetMs / 1000);

  const headers: Record<string, string> = {
    "x-ratelimit-limit": String(o.limit),
    "x-ratelimit-remaining": String(remaining),
    "x-ratelimit-reset": String(reset),
  };
  if (!allowed) {
    headers["retry-after"] = String(Math.max(0, Math.ceil((resetMs - nowMs) / 1000)));
  }

  return { allowed, remaining, limit: o.limit, reset, headers };
}

/**
 * clientIdFromHeaders: derive a semi-stable key from request headers
 * Use with care; for production you may prefer an authenticated user id.
 */
export function clientIdFromHeaders(h: Headers) {
  const xf = h.get("x-forwarded-for") || "";
  const ip = xf.split(",")[0].trim() ||
             h.get("x-real-ip") ||
             h.get("cf-connecting-ip") ||
             "anon";
  const ua = h.get("user-agent") || "ua";
  return `${ip}:${ua.slice(0,64)}`;
}
