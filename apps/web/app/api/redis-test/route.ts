import { NextResponse } from "next/server";
export const runtime = "edge";

const DEBUG = (process.env.DEBUG_PUBLIC_PROBES || "").toLowerCase() === "on";
const IS_PROD = process.env.NODE_ENV === "production";

export async function GET() {
  // Dev-only probe: always hidden in production unless explicitly enabled via DEBUG_PUBLIC_PROBES=on
  if (IS_PROD && !DEBUG) {
    return NextResponse.json({ ok: false, error: "not available" }, { status: 404 });
  }

  const url = process.env.UPSTASH_REDIS_REST_URL || "";
  const token = process.env.UPSTASH_REDIS_REST_TOKEN || "";

  // Minimal functionality in non-prod for quick sanity checks
  try {
    const { Redis } = await import("@upstash/redis");
    const redis = new Redis({ url, token });
    const pong = await redis.ping();
    return NextResponse.json({ ok: true, pong });
  } catch {
    return NextResponse.json({ ok: false, error: "not configured" }, { status: 404 });
  }
}
