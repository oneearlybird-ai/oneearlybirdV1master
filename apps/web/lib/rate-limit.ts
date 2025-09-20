// Edge-safe rate limiter with optional Upstash; falls back to in-memory.
// Note: Do NOT import server-only modules here (used by Edge routes too).

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
  const upstashUrl = (process.env.UPSTASH_REDIS_REST_URL || '').trim();
  const upstashToken = (process.env.UPSTASH_REDIS_REST_TOKEN || '').trim();
  const useUpstash = Boolean(upstashUrl && upstashToken);

  // Minimal in-memory windowed counter (per process)
  const mem = new Map<string, { used: number; exp: number }>();

  return {
    async limit(identifier: string): Promise<RateLimitResult> {
      const now = Date.now();
      const window = Math.floor(now / (windowSeconds * 1000));
      const key = `${prefix}:${identifier}:${window}`;
      const reset = (window + 1) * windowSeconds * 1000;

      // Prefer Upstash REST API if configured (Edge-safe)
      if (useUpstash) {
        try {
          const resp = await fetch(`${upstashUrl}/pipeline`, {
            method: 'POST',
            headers: { 'authorization': `Bearer ${upstashToken}`, 'content-type': 'application/json' },
            body: JSON.stringify([["INCR", key], ["EXPIRE", key, windowSeconds]]),
            cache: 'no-store',
          });
          const raw = await resp.json().catch(() => null) as unknown;
          let used = 0;
          if (Array.isArray(raw)) {
            const first = (raw as Array<Record<string, unknown>>)[0];
            const r = first?.result;
            used = typeof r === 'number' ? r : Number(r ?? 0);
          }
          const remaining = Math.max(0, tokensPerWindow - used);
          const success = used <= tokensPerWindow;
          return { success, limit: tokensPerWindow, remaining, reset };
        } catch {
          // On any failure, fall back to memory
        }
      }

      // In-memory fallback
      const rec = mem.get(key);
      if (!rec || rec.exp <= now) {
        mem.set(key, { used: 1, exp: reset });
        return { success: true, limit: tokensPerWindow, remaining: tokensPerWindow - 1, reset };
      }
      rec.used += 1;
      const remaining = Math.max(0, tokensPerWindow - rec.used);
      const success = rec.used <= tokensPerWindow;
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
