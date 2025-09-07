/**
 * Minimal fixed-window rate limiter using Upstash REST via getRedis().
 * PUBLIC zone only; never touch PHI paths.
 * Swap-ready: vendor can be changed behind this file.
 */
import { getRedis } from "./redis";

export type RateLimitResult = {
  success: boolean;
  limit: number;
  remaining: number;
  reset: number; // epoch ms when window resets
};

type Options = {
  tokensPerWindow?: number;
  windowSeconds?: number;
  prefix?: string;
};

export function createRateLimiter(opts: Options = {}) {
  const tokensPerWindow = opts.tokensPerWindow ?? 60;
  const windowSeconds = opts.windowSeconds ?? 60;
  const prefix = opts.prefix ?? "rate";

  const redis = getRedis();

  return {
    async limit(identifier: string): Promise<RateLimitResult> {
      const now = Date.now();
      const window = Math.floor(now / (windowSeconds * 1000));
      const key = `${prefix}:${identifier}:${window}`;

      const used = (await redis.incr(key)) as unknown as number;
      if (used === 1) {
        await redis.set(key, String(used), windowSeconds);
      }

      const remaining = Math.max(0, tokensPerWindow - used);
      const success = used <= tokensPerWindow;
      const reset = (window + 1) * windowSeconds * 1000;

      return { success, limit: tokensPerWindow, remaining, reset };
    },
  };
}
