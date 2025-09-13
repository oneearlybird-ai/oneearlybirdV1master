// apps/web/app/api/voice/status/route.ts
// Twilio Status Callback — official signature validator; fail-closed 403; CSP-safe
import twilio from 'twilio';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function paramsFromURLEncoded(text: string): Record<string, string> {
  const out: Record<string, string> = {};
  const usp = new URLSearchParams(text);
  for (const [k, v] of usp.entries()) out[k] = v;
  return out;
}

function absoluteUrlFrom(req: Request): string {
  const u = new URL(req.url);
  const proto = (req.headers.get('x-forwarded-proto') ?? u.protocol.replace(':',''));
  const host  = (req.headers.get('x-forwarded-host')  ?? req.headers.get('host') ?? u.host);
  return `${proto}://${host}${u.pathname}`;
}

export async function GET() {
  return new Response('ok', { status: 200, headers: { 'cache-control': 'no-store' } });
}

export async function POST(req: Request) {
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const signature = req.headers.get('x-twilio-signature') || '';
  if (!authToken || !signature) return new Response('forbidden', { status: 403, headers: { 'cache-control': 'no-store' } });

  const ct = req.headers.get('content-type') || '';
  if (!ct.includes('application/x-www-form-urlencoded')) {
    return new Response('forbidden', { status: 403, headers: { 'cache-control': 'no-store' } });
  }

  const bodyText = await req.text();
  const params = paramsFromURLEncoded(bodyText);
  const url = absoluteUrlFrom(req);

  const valid = twilio.validateRequest(authToken, signature, url, params);
  if (!valid) return new Response('forbidden', { status: 403, headers: { 'cache-control': 'no-store' } });

  return new Response('ok', { status: 200, headers: { 'cache-control': 'no-store' } });
}
