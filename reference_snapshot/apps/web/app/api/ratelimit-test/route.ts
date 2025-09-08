import { NextRequest, NextResponse } from "next/server";
import { getRedis } from "@/lib/redis";

export async function GET(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  const windowSeconds = 60;
  const limit = 5;
  const bucket = Math.floor(Date.now() / (windowSeconds * 1000));
  const key = `rl:test:${ip}:${bucket}`;

  const redis = getRedis();
  const usedRaw = await redis.incr(key);
  const used = typeof usedRaw === "number" ? usedRaw : Number(usedRaw);
  if (used === 1) {
    await redis.expire(key, windowSeconds);
  }

  if (used > limit) {
    return NextResponse.json({ ok: false, used, limit }, { status: 429 });
  }
  return NextResponse.json({ ok: true, used, limit }, { status: 200 });
}
