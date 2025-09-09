import { compose, json, withCors, withRateLimit } from '@/lib/backend/shield';
const handler = async () => json({ up: true, ts: Date.now() });
export const GET = compose(withCors, withRateLimit)(handler);
