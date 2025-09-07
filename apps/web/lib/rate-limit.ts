import { getRedis } from '@/lib/redis';
import type { NextRequest } from 'next/server';
import { Redis } from '@upstash/redis';
import { Ratelimit } from '@upstash/ratelimit';

interface RateLimitResult {
  success: boolean;
  limit: number;
  remaining: number;
  reset: number;
}

/**
 * Sliding-window limiter using INCR and conditional EXPIRE.
 * - Fully typed (no `any`)
 * - Public zone only; do not use for PHI/protected zone
 */
export async function rateLimit(
  identifier: string,
  limit = 10,
  windowSeconds = 60,
): Promise<RateLimitResult> {
  const redis = getRedis() as unknown as { incr(key: string): Promise<number>; expire(key: string, seconds: number): Promise<number> };
  const key = `rate-limit:${identifier}`;

  const count = await redis.incr(key);
  if (count === 1) {
    // Key created: set TTL once per window
    await redis.expire(key, windowSeconds);
  }

  const remaining = Math.max(0, limit - count);
  const reset = Math.floor(Date.now() / 1000) + windowSeconds;

  return {
    success: count <= limit,
    limit,
    remaining,
    reset,
  };
}

/**
 * Edge-safe upstream guard using Upstash Ratelimit.
 * Public zone only (not for PHI/protected zone).
 */
const LIMIT_PER_MIN = parseInt(process.env.RATE_LIMIT_PER_MINUTE ?? '60', 10);
const upstreamRedis = Redis.fromEnv();
export const upstreamRatelimit = new Ratelimit({
  redis: upstreamRedis,
  limiter: Ratelimit.slidingWindow(LIMIT_PER_MIN, '1 m'),
  analytics: true,
  prefix: 'rl:upstream',
});

export async function guardUpstream(req: NextRequest) {
  const ip = req.ip ?? req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown';
  const path = new URL(req.url).pathname;
  const ua = (req.headers.get('user-agent') || '-').slice(0, 64);
  const key = `${ip}:${path}:${ua}`;
  const r = await upstreamRatelimit.limit(key);
  const h = new Headers({
    'X-RateLimit-Limit': String(r.limit),
    'X-RateLimit-Remaining': String(r.remaining),
    'X-RateLimit-Reset': String(r.reset),
  });
  return { ok: r.success, headers: h };
}
