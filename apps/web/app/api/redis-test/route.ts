import { NextResponse } from 'next/server';
import { Redis } from '@upstash/redis';

const redis = Redis.fromEnv();

export async function GET() {
  try {
    const pong = await redis.ping();
    return NextResponse.json({ ok: true, pong });
  } catch (err: any) {
    console.error('Redis test error:', err);
    return NextResponse.json(
      { ok: false, error: 'Redis connection failed' },
      { status: 500 },
    );
  }
}
