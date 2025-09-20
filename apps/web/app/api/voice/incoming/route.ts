export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
import crypto from 'crypto';

type TwilioModule = {
  validateRequest: (
    token: string,
    signature: string,
    url: string,
    params: Record<string, string>
  ) => boolean;
  validateRequestWithBody: (
    token: string,
    signature: string,
    url: string,
    body: string
  ) => boolean;
};

function externalUrl(req: Request): string {
  const site = process.env.NEXT_PUBLIC_SITE_URL || '';
  const u = new URL(req.url);
  if (site) {
    const s = new URL(site);
    u.protocol = s.protocol;
    u.host = s.host;
  } else {
    u.protocol = 'https:';
  }
  return u.toString();
}

function b64url(buf: Buffer) {
  return buf.toString('base64').replace(/=/g,'').replace(/\+/g,'-').replace(/\//g,'_');
}

function signJwtHS256(payload: Record<string, unknown>, secret: string) {
  const header = { alg: 'HS256', typ: 'JWT' };
  const h = b64url(Buffer.from(JSON.stringify(header)));
  const p = b64url(Buffer.from(JSON.stringify(payload)));
  const data = `${h}.${p}`;
  const sig = crypto.createHmac('sha256', secret).update(data).digest();
  return `${data}.${b64url(sig)}`;
}

export async function POST(req: Request) {
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const mediaUrl = process.env.MEDIA_WSS_URL;
  const sharedSecret = process.env.MEDIA_SHARED_SECRET || '';
  const sigOptional = process.env.TWILIO_SIGNATURE_OPTIONAL === '1';
  const sigDebug = process.env.TWILIO_SIG_DEBUG === '1';
  if (!authToken || !mediaUrl) {
    return new Response('Twilio not configured', { status: 503, headers: { 'cache-control': 'no-store' } });
  }
  const sig = req.headers.get('x-twilio-signature') ?? '';
  const fullUrl = externalUrl(req);
  const raw = await req.text();
  const contentType = req.headers.get('content-type') || '';

  const mod: any = await import('twilio');
  const tw = (mod?.default ?? mod) as TwilioModule;
  let valid = false;
  if (contentType.includes('application/json')) {
    valid = tw.validateRequestWithBody(authToken, sig, fullUrl, raw);
  } else {
    const params = Object.fromEntries(new URLSearchParams(raw)) as Record<string, string>;
    valid = tw.validateRequest(authToken, sig, fullUrl, params);
  }
  if (!valid && !sigOptional) {
    if (sigDebug) {
      console.error('[twilio] signature failed', {
        url: fullUrl,
        method: 'POST',
        contentType,
        hasSig: Boolean(sig),
        bodyLen: raw.length,
      });
    }
    return new Response('Forbidden', { status: 403, headers: { 'cache-control': 'no-store' } });
  }

  // Build token: prefer short-lived JWT when MEDIA_SHARED_SECRET is set; else fallback to static MEDIA_AUTH_TOKEN
  const now = Math.floor(Date.now() / 1000);
  let callSid = '';
  try {
    const ct = (req.headers.get('content-type') || '').toLowerCase();
    if (ct.includes('application/x-www-form-urlencoded')) {
      const params = Object.fromEntries(new URLSearchParams(await (async()=>{ const t=await req.clone().text(); return t; })())) as Record<string,string>;
      callSid = params['CallSid'] || '';
    } else {
      const body = await req.clone().text();
      try { const js = JSON.parse(body); callSid = js?.CallSid || ''; } catch {}
    }
  } catch {}

  const wsUrl = (() => {
    try {
      const u = new URL(mediaUrl);
      let tok = '';
      if (sharedSecret) {
        const payload = { aud: 'media', iat: now, exp: now + 120, jti: crypto.randomBytes(8).toString('hex'), call_sid: callSid };
        tok = signJwtHS256(payload, sharedSecret);
      } else if (process.env.MEDIA_AUTH_TOKEN) {
        tok = process.env.MEDIA_AUTH_TOKEN;
      }
      if (tok) {
        if (u.search) u.search += `&token=${encodeURIComponent(tok)}`;
        else u.search = `?token=${encodeURIComponent(tok)}`;
      }
      return u.toString();
    } catch {
      return mediaUrl;
    }
  })();

  const xml =
    `<?xml version="1.0" encoding="UTF-8"?>` +
    `<Response><Connect><Stream track="both_tracks" url="${wsUrl}"/></Connect></Response>`;
  if (sigDebug) {
    const safeWsUrl = wsUrl.replace(/token=[^&]+/, 'token=***');
    console.log('[twilio] returning TwiML Stream', { url: fullUrl, wsUrl: safeWsUrl });
  }
  return new Response(xml, { status: 200, headers: { 'Content-Type': 'application/xml', 'cache-control': 'no-store' } });
}
