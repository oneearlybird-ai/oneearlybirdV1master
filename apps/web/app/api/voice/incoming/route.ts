import twilio from 'twilio';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function fullUrl(req: Request) {
  const u = new URL(req.url);
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
  const url = fullUrl(req);
  const params = await readFormParams(req);

  if (!authToken || !signature || !twilio.validateRequest(authToken, signature, url, params)) {
    return new Response('Forbidden', { status: 403 });
  }

  const wss = process.env.MEDIA_WSS_URL || '';
  if (!wss) return new Response('Service Unavailable', { status: 503 });

  const vr = new twilio.twiml.VoiceResponse();
  const connect = vr.connect();
  connect.stream({ url: wss });
  return new Response(vr.toString(), { status: 200, headers: { 'Content-Type': 'text/xml' } });
}

