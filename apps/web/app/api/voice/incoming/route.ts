export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

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

export async function POST(req: Request) {
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const mediaUrl = process.env.MEDIA_WSS_URL;
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

  // Append token query param if MEDIA_AUTH_TOKEN is configured (for media WS auth)
  const token = process.env.MEDIA_AUTH_TOKEN || '';
  const wsUrl = (() => {
    if (!token) return mediaUrl;
    try {
      const u = new URL(mediaUrl);
      if (u.search) u.search += `&token=${encodeURIComponent(token)}`;
      else u.search = `?token=${encodeURIComponent(token)}`;
      return u.toString();
    } catch {
      const sep = mediaUrl.includes('?') ? '&' : '?';
      return `${mediaUrl}${sep}token=${encodeURIComponent(token)}`;
    }
  })();

  const xml =
    `<?xml version="1.0" encoding="UTF-8"?>` +
    `<Response><Connect><Stream track="both" url="${wsUrl}"/></Connect></Response>`;
  if (sigDebug) {
    console.log('[twilio] returning TwiML Stream', { url: fullUrl, wsUrl });
  }
  return new Response(xml, { status: 200, headers: { 'Content-Type': 'application/xml', 'cache-control': 'no-store' } });
}
