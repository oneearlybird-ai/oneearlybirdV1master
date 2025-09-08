import { NextRequest } from 'next/server';
import { z } from 'zod';
import { compose, json, withCors, withRateLimit, withSizeLimit, withJsonBody } from '@/lib/backend/shield';

const Body = z.object({
  message: z.string().max(2000),
  meta: z.record(z.string(), z.any()).optional()
});

const handler = async (_req: NextRequest, body: z.infer<typeof Body>) => {
  return json({ echo: body.message, meta: body.meta ?? null, ts: Date.now() });
};

export const POST = compose(withCors, withRateLimit, withSizeLimit)((req: NextRequest) => withJsonBody(Body, handler)(req));
