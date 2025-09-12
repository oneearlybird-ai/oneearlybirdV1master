// apps/web/app/api/voice/status/route.ts
// Twilio Status Callback — official validator; fail-closed 403; CSP-safe
import twilio from 'twilio';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function paramsFromURLEncoded(text: string): Record<string, string> {
  const out: Record<string, string> = {};
  const usp = new URLSearchParams(text);
  for (const [k, v] of usp.entries()) out[k] = v;
  return out;
}

export async function GET() {
  // health check for Twilio console / ops
  return new Response('ok', { status: 200 });
}

export async function POST(req: Request) {
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const signature = req.headers.get('x-twilio-signature') || '';
  if (!authToken || !signature) {
    return new Response('forbidden', { status: 403 });
  }

  const contentType = req.headers.get('content-type') || '';
  if (!contentType.includes('application/x-www-form-urlencoded')) {
    // Twilio status callbacks are form-encoded; reject unexpected content types
    return new Response('forbidden', { status: 403 });
  }

  const bodyText = await req.text();
  const params = paramsFromURLEncoded(bodyText);

  // Absolute URL Twilio hit
  const url = req.url;
  const valid = twilio.validateRequest(authToken, signature, url, params);
  if (!valid) {
    return new Response('forbidden', { status: 403 });
  }

  // Acknowledge quickly (no PHI/PII in response or logs)
  return new Response('ok', { status: 200 });
}
