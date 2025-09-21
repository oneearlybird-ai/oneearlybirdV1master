export const runtime = 'nodejs';
import crypto from 'crypto';

export async function GET() {
  const s = process.env.MEDIA_SHARED_SECRET ?? '';
  const len = Buffer.from(s, 'utf8').length;
  const sha256 = crypto.createHash('sha256').update(s, 'utf8').digest('hex');
  return new Response(JSON.stringify({ len, sha256 }), {
    headers: { 'content-type': 'application/json' },
  });
}

