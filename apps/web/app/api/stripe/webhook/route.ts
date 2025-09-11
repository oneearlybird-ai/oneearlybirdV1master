import Stripe from 'stripe';

export const runtime = 'nodejs';           // ensure Node runtime (no edge)
export const dynamic = 'force-dynamic';    // always execute (no static cache)

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2024-06-20',
});

function bad(status: number, msg: string) {
  return new Response(msg, { status });
}

export async function POST(req: Request) {
  // 1) RAW body (required for Stripe signature verification)
  let raw = '';
  try {
    raw = await req.text();
  } catch {
    return bad(400, 'raw body required');
  }

  // 2) Verify Stripe signature
  const sig = req.headers.get('stripe-signature');
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!sig || !secret) return bad(400, 'missing signature or secret');

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(raw, sig, secret);
  } catch {
    return bad(400, 'invalid signature');
  }

  // 3) Minimal PHI-safe handling (fast-path ack; no sensitive logs)
  switch (event.type) {
    case 'invoice.payment_succeeded':
    case 'customer.subscription.created':
    case 'customer.subscription.updated':
    case 'customer.subscription.deleted':
    case 'checkout.session.completed':
      // TODO: enqueue internal job (usage/CRM). Keep logs PHI-free.
      break;
    default:
      // Accept unknown types idempotently
      break;
  }
  return new Response('ok', { status: 200 });
}

// 4) Unsigned GET health (no details; OK for smoke)
export async function GET() {
  return new Response(JSON.stringify({ ok: true, service: 'stripe-webhook' }), {
    status: 200,
    headers: { 'content-type': 'application/json' },
  });
}
