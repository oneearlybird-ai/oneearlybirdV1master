export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

import Stripe from 'stripe';

function bad(status: number, msg: string) {
  return new Response(msg, { status });
}

export async function POST(req: Request) {
  try {
    const sig = req.headers.get('stripe-signature');
    if (!sig) return bad(403, 'missing signature');

    const secret = process.env.STRIPE_WEBHOOK_SECRET;
    if (!secret) return bad(500, 'misconfigured');

    const body = await req.text(); // RAW body only
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '');

    let event: Stripe.Event;
    try {
      event = stripe.webhooks.constructEvent(body, sig, secret);
    } catch (e: any) {
      return bad(400, 'invalid signature');
    }

    // Fast-path acknowledge; extend safely as needed
    switch (event.type) {
      case 'invoice.payment_succeeded':
      case 'customer.subscription.created':
      case 'customer.subscription.updated':
      case 'customer.subscription.deleted':
      default:
        break;
    }

    return new Response('ok', { status: 200 });
  } catch {
    return bad(500, 'error');
  }
}
