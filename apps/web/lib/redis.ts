import { Redis } from "@upstash/redis";

/**
 * Centralized, compile-safe Redis client for PUBLIC ZONE features (e.g., rate limiting).
 * - Reads credentials from environment only (never hardcoded).
 * - Throws with a clear error if not configured (so PHI paths must not depend on it).
 * - Keep non-HIPAA caches out of PROTECTED ZONE code paths.
 */
let client: Redis | null = null;

export function getRedis(): Redis {
  if (client) return client;
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) {
    throw new Error("Redis not configured: set UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN");
  }
  client = new Redis({ url, token });
  return client;
}
