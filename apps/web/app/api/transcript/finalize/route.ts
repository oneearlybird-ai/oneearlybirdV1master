export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function bad(msg: string) {
  return new Response(JSON.stringify({ ok: false, error: msg }), {
    status: 400,
    headers: { 'content-type': 'application/json' }
  });
}

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => null);
    if (!body || typeof body !== 'object') return bad('Invalid JSON');
  } catch {
    return bad('Invalid JSON');
  }
  return new Response(JSON.stringify({ ok: true, status: 'accepted' }), {
    status: 202,
    headers: { 'content-type': 'application/json' }
  });
}
