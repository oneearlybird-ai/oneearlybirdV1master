import { getRedis } from '@/lib/redis';

interface RateLimitResult {
  success: boolean;
  limit: number;
  remaining: number;
  reset: number;
}

/**
 * Simple sliding window rate limiter.
 * - Keyed by identifier (IP, user ID, etc).
 * - Uses Redis INCR + EXPIRE for atomicity.
 */
export async function rateLimit(
  identifier: string,
  limit = 10,
  windowSeconds = 60,
): Promise<RateLimitResult> {
  const redis = getRedis();
  const key = `rate-limit:${identifier}`;

  const tx = redis.multi();
  tx.incr(key);
  tx.expire(key, windowSeconds);
  const [count] = (await tx.exec()) as [number, unknown];

  const remaining = Math.max(0, limit - count);
  const reset = Math.floor(Date.now() / 1000) + windowSeconds;

  return {
    success: count <= limit,
    limit,
    remaining,
    reset,
  };
}
