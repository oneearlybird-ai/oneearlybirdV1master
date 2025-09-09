export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function badReq(msg: string) {
  return new Response(msg, { status: 400, headers: { 'content-type': 'text/plain;charset=UTF-8' } });
}

export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return badReq('Invalid JSON');
  }
  if (typeof body !== 'object' || body === null) return badReq('Invalid JSON');
  const obj = body as Record<string, unknown>;
  const requestId = typeof obj.request_id === 'string' ? obj.request_id : undefined;
  const redacted = requestId ? `${requestId.slice(0,4)}…` : undefined;
  return new Response(JSON.stringify({ ok: true, status: 'accepted', request_id: redacted }), {
    status: 202,
    headers: { 'content-type': 'application/json' },
  });
}

