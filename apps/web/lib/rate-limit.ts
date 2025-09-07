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
        // Upstash-style signature expects options, not a bare TTL number.
        await redis.set(key, String(used), { ex: windowSeconds } as any);
      }

      const remaining = Math.max(0, tokensPerWindow - used);
      const success = used <= tokensPerWindow;
      const reset = (window + 1) * windowSeconds * 1000;

      return { success, limit: tokensPerWindow, remaining, reset };
    },
  };
}

/**
 * Minimal upstream guard used by /api/upstream.
 * Accepts a string identifier, or an object (e.g. NextRequest) from which we derive an IP-ish key.
 * Returns the same shape as RateLimitResult for callers to decide response behavior.
 */
export async function guardUpstream(arg: unknown): Promise<RateLimitResult> {
  const limiter = createRateLimiter({ tokensPerWindow: 60, windowSeconds: 60, prefix: "rate:upstream" });
  const id =
    typeof arg === "string"
      ? arg
      : ((arg as any)?.ip ??
         (arg as any)?.headers?.get?.("x-forwarded-for")?.split(",")[0]?.trim() ??
         "anon");
  return limiter.limit(String(id));
}
