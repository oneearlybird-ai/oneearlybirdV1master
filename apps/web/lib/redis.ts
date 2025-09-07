import { Redis } from '@upstash/redis';

/**
 * Centralized, hardened Redis client.
 * - Only one connection is ever made.
 * - Reads credentials from environment (never hardcoded).
 * - Can be wrapped with guards for safe fail-closed behavior.
 */
let redis: Redis | null = null;

export function getRedis(): Redis {
  if (!redis) {
    if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) {
      throw new Error('Redis environment variables not set');
    }
    redis = new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN,
    });
  }
  return redis;
}
