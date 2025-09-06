import { NextRequest, NextResponse } from "next/server";
import { Redis } from "@upstash/redis";
import { Ratelimit } from "@upstash/ratelimit";

const LIMIT_PER_MIN = parseInt(process.env.RATE_LIMIT_PER_MINUTE ?? "60", 10);
const redis = Redis.fromEnv();
export const upstreamRatelimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(LIMIT_PER_MIN, "1 m"),
  analytics: true,
  prefix: "rl:upstream",
});

export async function guardUpstream(req: NextRequest) {
  const ip =
    req.ip ??
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    "unknown";
  const path = new URL(req.url).pathname;
  const ua = (req.headers.get("user-agent") || "-").slice(0, 64);
  const key = `${ip}:${path}:${ua}`;
  const r = await upstreamRatelimit.limit(key);
  const h = new Headers({
    "X-RateLimit-Limit": String(r.limit),
    "X-RateLimit-Remaining": String(r.remaining),
    "X-RateLimit-Reset": String(r.reset),
  });
  return { ok: r.success, headers: h };
}
