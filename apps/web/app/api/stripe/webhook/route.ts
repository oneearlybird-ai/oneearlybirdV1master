import Stripe from 'stripe';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  const sig = req.headers.get('stripe-signature') || '';
  const secret = process.env.STRIPE_WEBHOOK_SECRET || '';
  const raw = await req.text();

  if (!sig || !secret) {
    return new Response('Bad Request', { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = Stripe.webhooks.constructEvent(raw, sig, secret);
  } catch (_) {
    return new Response('Forbidden', { status: 403 });
  }

  switch (event.type) {
    case 'invoice.paid':
    case 'customer.subscription.updated':
    case 'customer.subscription.created':
    case 'customer.subscription.deleted':
    case 'checkout.session.completed':
      break;
    default:
      break;
  }

  return new Response('ok', { status: 200 });
}
