import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

export const runtime = "nodejs";

function looksLikeStripeKey(v: string) {
  return /^sk_(test|live)_[A-Za-z0-9]+$/.test(v);
}
function looksLikeCustomer(v: string) {
  return /^cus_[A-Za-z0-9]+$/.test(v);
}

export async function POST(req: NextRequest) {
  const secret = process.env.STRIPE_API_KEY || "";
  const returnUrl =
    process.env.NEXT_PUBLIC_BASE_URL ||
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "");

  if (!looksLikeStripeKey(secret) || !returnUrl) {
    return NextResponse.json({ ok: false, error: "unconfigured" }, { status: 400 });
  }

  const customerId = process.env.STRIPE_TEST_CUSTOMER_ID || "";
  if (!looksLikeCustomer(customerId)) {
    return NextResponse.json({ ok: false, error: "no customer" }, { status: 400 });
  }

  const stripe = new Stripe(secret, { apiVersion: "2024-06-20" as Stripe.LatestApiVersion });
  const session = await stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: `${returnUrl}/dashboard/billing`
  });

  return NextResponse.json({ ok: true, url: session.url });
}
