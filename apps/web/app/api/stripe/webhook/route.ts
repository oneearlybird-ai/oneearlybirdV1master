import Stripe from 'stripe';
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export async function POST(req: Request) {
  const sig = req.headers.get('stripe-signature') || '';
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret || !sig) return new Response('Missing signature or secret', { status: 400 });
  try {
    const raw = await req.text();
    const event = Stripe.webhooks.constructEvent(raw, sig, secret);
    switch (event.type) {
      case 'invoice.paid':
      case 'customer.subscription.updated':
      case 'checkout.session.completed':
        break;
      default:
        break;
    }
    return new Response('ok', { status: 200 });
  } catch {
    return new Response('Signature verification failed', { status: 400 });
  }
}
