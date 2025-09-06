import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { assertStripeMetadataPHIZero } from "../../../lib/stripeGuard";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET || "";
  if (!secret) {
    return NextResponse.json({ ok: false, error: "unconfigured" }, { status: 400 });
  }
  const sig = req.headers.get("stripe-signature") || "";
  if (!sig) {
    return NextResponse.json({ ok: false, error: "missing signature" }, { status: 400 });
  }
  const stripe = new Stripe(process.env.STRIPE_API_KEY || "sk_test_placeholder", { apiVersion: "2024-06-20" as any });
  const raw = await req.text();
  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(raw, sig, secret);
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: "invalid signature" }, { status: 400 });
  }
  const obj: any = (event as any).data?.object || {};
  const meta = obj?.metadata || {};
  try {
    assertStripeMetadataPHIZero(meta);
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: "phi metadata blocked" }, { status: 400 });
  }
  return NextResponse.json({ ok: true, id: event.id, type: event.type });
}
