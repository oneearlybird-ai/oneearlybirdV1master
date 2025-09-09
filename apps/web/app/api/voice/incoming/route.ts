import twilio from 'twilio';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function targetUrl(req: Request) {
  const site = process.env.NEXT_PUBLIC_SITE_URL || '';
  const u = new URL(req.url);
  const qp = u.search; // includes leading '?' or ''
  if (site) return `${site.replace(/\/$/, '')}/api/voice/incoming${qp}`;
  // Fallback to request host/proto if site not configured
  const proto = (req.headers.get('x-forwarded-proto') || u.protocol.replace(':','')).toLowerCase();
  const host = req.headers.get('host')!;
  return `${proto}://${host}${u.pathname}${u.search}`;
}

async function readFormParams(req: Request) {
  const ct = req.headers.get('content-type') || '';
  if (ct.includes('application/x-www-form-urlencoded')) {
    const fd = await req.formData();
    const obj: Record<string,string> = {};
    for (const [k,v] of fd.entries()) obj[k] = String(v);
    return obj;
  }
  return {};
}

export async function POST(req: Request) {
  const authToken = process.env.TWILIO_AUTH_TOKEN || '';
  const signature = req.headers.get('x-twilio-signature') || req.headers.get('X-Twilio-Signature') || '';
  const url = targetUrl(req);
  const params = await readFormParams(req);

  if (!authToken || !signature || !twilio.validateRequest(authToken, signature, url, params)) {
    return new Response('Forbidden', { status: 403 });
  }

  const base = process.env.MEDIA_WSS_URL || '';
  if (!base) return new Response('Service Unavailable', { status: 503 });
  const streamUrl = `${base.replace(/\/$/, '')}/rtm/voice`;

  const vr = new twilio.twiml.VoiceResponse();
  const connect = vr.connect();
  connect.stream({ url: streamUrl });
  return new Response(vr.toString(), { status: 200, headers: { 'Content-Type': 'text/xml' } });
}
