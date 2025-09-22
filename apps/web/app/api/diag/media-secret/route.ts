export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function sha256Hex(s: string) {
  const crypto = require('crypto');
  return crypto.createHash('sha256').update(s).digest('hex');
}

export async function GET(req: Request) {
  const key = req.headers.get('x-smoke-key') || '';
  const expect = process.env.SMOKE_KEY || '';
  if (!expect || key !== expect) return new Response('forbidden', { status: 403 });
  const jwt = process.env.MEDIA_SHARED_SECRET || '';
  const tok = process.env.MEDIA_AUTH_TOKEN || '';
  const mode = jwt ? 'jwt' : (tok ? 'token' : 'none');
  const raw = jwt || tok;
  const body = { mode, len: raw.length, sha256: raw ? sha256Hex(raw) : '' };
  return new Response(JSON.stringify(body), { status: 200, headers: { 'content-type': 'application/json', 'cache-control': 'no-store' } });
}

