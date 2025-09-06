import { NextResponse } from "next/server";

export const runtime = "edge";

function isUnset(v: string | undefined | null) {
  if (v === undefined || v === null) return true;
  const s = String(v).trim().toLowerCase();
  return s === "" || s === "undefined" || s === "null";
}

export async function GET() {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;

  if (isUnset(url) || isUnset(token)) {
    return NextResponse.json({ ok: false, error: "not configured" }, { status: 404 });
    }

  const { Redis } = await import("@upstash/redis");
  const redis = new Redis({ url: String(url), token: String(token) });
  const pong = await redis.ping();
  return NextResponse.json({ ok: true, pong });
}
