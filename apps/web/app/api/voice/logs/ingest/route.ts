export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function ok(body: unknown) {
  return new Response(JSON.stringify(body), {
    status: 200,
    headers: { 'content-type': 'application/json', 'cache-control': 'no-store' },
  });
}

export async function POST(req: Request) {
  const logKey = process.env.VOICE_LOG_KEY || process.env.SMOKE_KEY || '';
  const key = req.headers.get('x-log-key') || req.headers.get('x-smoke-key') || '';
  let body: any = {};
  try { body = await req.json(); } catch { void 0; }
  // Accept if authenticated OR payload looks like Twilio Event Streams (contains subscribed event types)
  const looksLikeEventStream = !!(body && (Array.isArray(body) || body?.type || body?.Types || body?.events));
  if (!looksLikeEventStream && (!logKey || key !== logKey)) return new Response('forbidden', { status: 403 });
  try {
    const redacted = JSON.parse(JSON.stringify(body));
    if (redacted?.url && typeof redacted.url === 'string') {
      redacted.url = String(redacted.url).replace(/token=[^&]+/, 'token=***');
    }
    if (redacted?.qp_token) redacted.qp_token = '***';
    console.log('[gw-log]', redacted?.type || 'event', redacted);
  } catch { void 0; }
  return ok({ status: 'ok' });
}
