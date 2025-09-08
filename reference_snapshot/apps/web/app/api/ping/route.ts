import { NextResponse } from "next/server";
import { createRateLimiter } from "@/lib/rate-limit";

export async function GET(request: Request) {
  const limiter = createRateLimiter({ tokensPerWindow: 30, windowSeconds: 60, prefix: "rate:ping" });
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "anon";
  const res = await limiter.limit(ip);

  const headers = new Headers();
  headers.set("X-RateLimit-Limit", String(res.limit));
  headers.set("X-RateLimit-Remaining", String(res.remaining));
  headers.set("X-RateLimit-Reset", String(Math.ceil(res.reset / 1000)));

  if (!res.success) {
    const retryAfter = Math.max(0, Math.ceil((res.reset - Date.now()) / 1000));
    headers.set("Retry-After", String(retryAfter));
    return new NextResponse(JSON.stringify({ ok: false }), { status: 429, headers });
  }

  return new NextResponse(JSON.stringify({ ok: true }), { status: 200, headers });
}
