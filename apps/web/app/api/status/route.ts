export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { compose, withCors, withRateLimit } from '@/lib/backend/shield';

const handler = async () => {
  const nowIso = new Date().toISOString();
  const dbEnabled = !!(process.env.DATABASE_URL || process.env.POSTGRES_URL);
  const cacheEnabled = !!(process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN);
  const storageEnabled = !!(process.env.S3_BUCKET && (process.env.S3_REGION || process.env.AWS_REGION));
  const sha = (process.env.VERCEL_GIT_COMMIT_SHA || process.env.GIT_REV || '').slice(0,7) || 'unknown';
  return NextResponse.json({
    up: true,
    ts: nowIso,
    health: {
      db: dbEnabled ? 'unknown' : 'disabled',
      cache: cacheEnabled ? 'unknown' : 'disabled',
      storage: storageEnabled ? 'unknown' : 'disabled',
    },
    version: { sha },
  });
};

export const GET = compose(withCors, withRateLimit)(handler);
