import { Redis } from '@upstash/redis';

// ---------- Types ----------
export type WindowOpts = {
  windowSeconds?: number;   // sliding window length
  max?: number;             // allowed requests within window
  blockForSeconds?: number; // optional hard block when exceeded
  strategy?: 'sliding' | 'fixed';
};

type Preset = 'strict' | 'lenient';

export type RateLimitResult = {
  limited: boolean;
  limit: number;
  remaining: number;
  reset: number; // unix seconds
};

// ---------- Env / Redis ----------
const REST_URL = process.env.UPSTASH_REDIS_REST_URL;
const REST_TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN;

let redis: Redis | null = null;
if (REST_URL && REST_TOKEN) {
  redis = new Redis({ url: REST_URL, token: REST_TOKEN });
}

// Fallback in-memory limiter for local/dev and build-time safety.
// NOTE: process memory only — not for multi-instance prod.
const memory = new Map<string, { count: number; reset: number }>();

// ---------- Presets & Normalize ----------
function presetToOpts(preset: Preset): Required<WindowOpts> {
  if (preset === 'strict') {
    return { windowSeconds: 60, max: 60, blockForSeconds: 300, strategy: 'sliding' };
  }
  // lenient default
  return { windowSeconds: 60, max: 120, blockForSeconds: 60, strategy: 'sliding' };
}

function normalizeOpts(opts?: WindowOpts | Preset): Required<WindowOpts> {
  if (!opts) return presetToOpts('lenient');
  if (typeof opts === 'string') return presetToOpts(opts);
  return {
    windowSeconds: opts.windowSeconds ?? 60,
    max: opts.max ?? 120,
    blockForSeconds: opts.blockForSeconds ?? 60,
    strategy: opts.strategy ?? 'sliding',
  };
}

// ---------- Public helpers ----------
export function rateLimitHeaders(d: { limit: number; remaining: number; reset: number }): Record<string, string> {
  const h: Record<string, string> = {
    'x-ratelimit-limit': String(d.limit),
    'x-ratelimit-remaining': String(d.remaining),
    'x-ratelimit-reset': String(d.reset),
  };
  if (d.remaining <= 0) {
    const now = Math.floor(Date.now() / 1000);
    const retry = Math.max(0, d.reset - now);
    h['retry-after'] = String(retry);
  }
  return h;
}

export function clientIdFromHeaders(h: Headers) {
  const xf = h.get('x-forwarded-for') || '';
  const ip = xf.split(',')[0].trim() || h.get('x-real-ip') || h.get('cf-connecting-ip') || 'anon';
  const ua = h.get('user-agent') || 'ua';
  return `${ip}:${ua.slice(0, 64)}`;
}

// ---------- Core limiter ----------
export async function checkRateLimit(key: string, opts?: WindowOpts | Preset): Promise<RateLimitResult> {
  const cfg = normalizeOpts(opts);
  const nowMs = Date.now();
  const nowSec = Math.floor(nowMs / 1000);

  // Hard block key (when exceeded) — independent of counters
  const blockKey = `rl:block:${key}`;

  if (redis) {
    // Check hard block
    const blockedTtl = await redis.ttl(blockKey);
    if (blockedTtl && blockedTtl > 0) {
      return {
        limited: true,
        limit: cfg.max,
        remaining: 0,
        reset: nowSec + blockedTtl,
      };
    }

    const windowKey = `rl:win:${cfg.strategy}:${cfg.windowSeconds}:${key}`;
    // Use a simple fixed window counter. Sliding can be emulated, but fixed is predictable.
    // INCR and set EXPIRE atomically with Lua for stronger guarantees; here keep it simple.
    const count = await redis.incr(windowKey);
    if (count === 1) {
      await redis.expire(windowKey, cfg.windowSeconds);
    }
    const ttl = (await redis.ttl(windowKey)) ?? cfg.windowSeconds;
    const remaining = Math.max(0, cfg.max - count);
    const limited = count > cfg.max;

    if (limited && cfg.blockForSeconds > 0) {
      // Set block; client will be limited until block TTL passes
      await redis.set(blockKey, '1', { ex: cfg.blockForSeconds });
      return {
        limited: true,
        limit: cfg.max,
        remaining: 0,
        reset: nowSec + cfg.blockForSeconds,
      };
    }

    return {
      limited,
      limit: cfg.max,
      remaining,
      reset: nowSec + (ttl > 0 ? ttl : cfg.windowSeconds),
    };
  }

  // In-memory fallback (dev only)
  const memKey = `mem:${cfg.windowSeconds}:${key}`;
  const rec = memory.get(memKey);
  if (!rec || rec.reset <= nowSec) {
    memory.set(memKey, { count: 1, reset: nowSec + cfg.windowSeconds });
    return { limited: false, limit: cfg.max, remaining: cfg.max - 1, reset: nowSec + cfg.windowSeconds };
  } else {
    rec.count += 1;
    const limited = rec.count > cfg.max;
    if (limited && cfg.blockForSeconds > 0) {
      // emulate block by extending reset
      rec.reset = nowSec + cfg.blockForSeconds;
      rec.count = cfg.max + 1;
      return { limited: true, limit: cfg.max, remaining: 0, reset: rec.reset };
    }
    return { limited, limit: cfg.max, remaining: Math.max(0, cfg.max - rec.count), reset: rec.reset };
  }
}
