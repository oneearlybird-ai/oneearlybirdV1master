import { NextRequest } from 'next/server';
import { compose, json, withCors, withRateLimit } from '@/lib/backend/shield';

const handler = async (_req: NextRequest) => {
  return json({
    up: true,
    ts: Date.now()
  });
};

export const GET = compose(withCors, withRateLimit)(handler);
