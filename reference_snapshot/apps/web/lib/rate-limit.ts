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

type HeaderGetter = { get(name: string): string | null };
type MaybeRequestLike = { ip?: string; headers?: HeaderGetter };

function extractClientId(arg: unknown): string {
  if (typeof arg === "string" && arg.trim().length > 0) return arg;
  const r = arg as MaybeRequestLike | undefined;
  const headerVal = r?.headers?.get("x-forwarded-for") ?? null;
  const fromHeader = headerVal ? headerVal.split(",")[0]?.trim() : undefined;
  return r?.ip || fromHeader || "anon";
}

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

      const usedRaw = await redis.incr(key);
  const used = typeof usedRaw === 'number' ? usedRaw : Number(usedRaw);
      if (used === 1) {
        await redis.set(key, String(used), { ex: windowSeconds } as { ex: number });
      }

      const remaining = Math.max(0, tokensPerWindow - used);
      const success = used <= tokensPerWindow;
      const reset = (window + 1) * windowSeconds * 1000;

      return { success, limit: tokensPerWindow, remaining, reset };
    },
  };
}

export async function guardUpstream(arg: unknown): Promise<{ ok: boolean; headers: Headers }> {
  const limiter = createRateLimiter({ tokensPerWindow: 60, windowSeconds: 60, prefix: "rate:upstream" });
  const id = extractClientId(arg);
  const res = await limiter.limit(id);

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
