export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function bad(msg: string) {
  return new Response(JSON.stringify({ ok: false, error: msg }), {
    status: 400,
    headers: { 'content-type': 'application/json' }
  });
}

export async function POST(req: Request) {
  try { await req.json(); } catch { return bad('Invalid JSON'); }
  return new Response(JSON.stringify({ ok: false, code: 'NOT_IMPLEMENTED' }), {
    status: 501,
    headers: { 'content-type': 'application/json' }
  });
}
