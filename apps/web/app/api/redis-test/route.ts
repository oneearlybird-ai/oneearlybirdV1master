import { NextResponse } from "next/server";

export const runtime = "edge";

export async function GET() {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;

  // In public zone builds, Upstash is optional. If not configured, hide the route.
  if (!url || !token) {
    return NextResponse.json({ ok: false, error: "not configured" }, { status: 404 });
  }

  // Lazy import to avoid build-time warnings
  const { Redis } = await import("@upstash/redis");
  const redis = new Redis({ url, token });

  const pong = await redis.ping();
  return NextResponse.json({ ok: true, pong });
}
