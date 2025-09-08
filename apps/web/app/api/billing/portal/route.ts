import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

export const runtime = "nodejs";

function looksLikeStripeKey(v: string) { return /^sk_(test|live)_[A-Za-z0-9]+$/.test(v); }
function looksLikeCustomer(v: string) { return /^cus_[A-Za-z0-9]+$/.test(v); }

export async function POST(req: NextRequest) {
  const cookie = req.headers.get("cookie") || "";
  const hasSession = /(^|;\s*)(__Secure-next-auth\.session-token|next-auth\.session-token)=/.test(cookie);
  if (!hasSession) { return NextResponse.json({ error: "Unauthorized" }, { status: 401 }); }
  const secret = (process.env.STRIPE_API_KEY || "").trim();
  const returnUrl = (
    process.env.NEXT_PUBLIC_BASE_URL ||
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "")
  ).trim();

  if (!looksLikeStripeKey(secret) || !returnUrl) {
    return NextResponse.json({ ok: false, error: "unconfigured: stripe key or return url" }, { status: 400 });
  }

  const url = new URL(req.url);
  const override = (url.searchParams.get("customer") || "").trim();
  const configured = (process.env.STRIPE_TEST_CUSTOMER_ID || "").trim();
  const customerId = override || configured;

  if (!looksLikeCustomer(customerId)) {
    return NextResponse.json({ ok: false, error: "no customer: missing or malformed cus_ id" }, { status: 400 });
  }

  const stripe = new Stripe(secret, { apiVersion: "2024-06-20" as Stripe.LatestApiVersion });

  try {
    await stripe.customers.retrieve(customerId);
    const session = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: `${returnUrl}/dashboard/billing`,
    });
    return NextResponse.json({ ok: true, url: session.url });
  } catch (e: unknown) {
    const err = e as { code?: string; type?: string; statusCode?: number; message?: string };
    const code = err?.code || err?.type || "stripe_error";
    const status = typeof err?.statusCode === "number" ? err.statusCode : 400;
    return NextResponse.json(
      { ok: false, error: "stripe_error", code, hint: "check test key, account/mode, and cus_ exists in same account" },
      { status }
    );
  }
}
