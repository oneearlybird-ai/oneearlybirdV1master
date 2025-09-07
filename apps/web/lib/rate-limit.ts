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
        // Our tiny Upstash REST wrapper expects a TTL number, not an options object.
        await redis.set(key, String(used), windowSeconds);
      }

      const remaining = Math.max(0, tokensPerWindow - used);
      const success = used <= tokensPerWindow;
      const reset = (window + 1) * windowSeconds * 1000;

      return { success, limit: tokensPerWindow, remaining, reset };
    },
  };
}

/**
 * Upstream guard used by /api/upstream.
 * Returns route-friendly shape: { ok, headers }.
 */
export async function guardUpstream(arg: unknown): Promise<{ ok: boolean; headers: Headers }> {
  const limiter = createRateLimiter({ tokensPerWindow: 60, windowSeconds: 60, prefix: "rate:upstream" });

  const id =
    typeof arg === "string"
      ? arg
      : ((arg as any)?.ip ??
         (arg as any)?.headers?.get?.("x-forwarded-for")?.split(",")[0]?.trim() ??
         "anon");

  const res = await limiter.limit(String(id));
  const headers = new Headers();
  headers.set("X-RateLimit-Limit", String(res.limit));
  headers.set("X-RateLimit-Remaining", String(res.remaining));
  headers.set("X-RateLimit-Reset", String(Math.ceil(res.reset / 1000)));

  if (!res.success) {
    const retryAfter = Math.max(0, Math.ceil((res.reset - Date.now()) / 1000));
    headers.set("Retry-After", String(retryAfter));
  }

  return { ok: res.success, headers };
}
