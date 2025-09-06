import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const secret = process.env.STRIPE_API_KEY || "";
  const returnUrl = process.env.NEXT_PUBLIC_BASE_URL || (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "");
  if (!secret || !returnUrl) {
    return NextResponse.json({ ok: false, error: "unconfigured" }, { status: 400 });
  }

  // TODO: Swap-ready: in production, derive customerId from authenticated user session
  const customerId = process.env.STRIPE_TEST_CUSTOMER_ID || "";
  if (!customerId) {
    return NextResponse.json({ ok: false, error: "no customer" }, { status: 400 });
  }

  const stripe = new Stripe(secret, { apiVersion: "2024-06-20" as Stripe.LatestApiVersion });
  const session = await stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: `${returnUrl}/dashboard/billing`
  });

  return NextResponse.json({ ok: true, url: session.url });
}
