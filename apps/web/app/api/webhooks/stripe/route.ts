import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { assertStripeMetadataPHIZero } from "@/lib/stripeGuard";

export const runtime = "nodejs";

function extractMetadata(obj: unknown): Record<string, unknown> {
  if (!obj || typeof obj !== "object") return {};
  // Stripe objects place metadata at top-level as a map
  // We avoid casting to a wide union; do a guarded lookup.
  const maybe = obj as { metadata?: unknown };
  if (maybe && typeof maybe.metadata === "object" && maybe.metadata !== null) {
    return maybe.metadata as Record<string, unknown>;
  }
  return {};
}

export async function POST(req: NextRequest): Promise<Response> {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret) return NextResponse.json({ ok: false, error: "unconfigured" }, { status: 400 });

  const sig = req.headers.get("stripe-signature");
  if (!sig) return NextResponse.json({ ok: false, error: "missing signature" }, { status: 400 });

  const stripe = new Stripe(process.env.STRIPE_API_KEY!, {
    apiVersion: "2024-06-20" as Stripe.LatestApiVersion,
  });

  const raw = await req.text();

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(raw, sig, secret);
  } catch {
    return NextResponse.json({ ok: false, error: "invalid signature" }, { status: 400 });
  }

  const meta = extractMetadata(event.data?.object as unknown);
  try {
    assertStripeMetadataPHIZero(meta);
  } catch {
    return NextResponse.json({ ok: false, error: "phi metadata blocked" }, { status: 400 });
  }

  return NextResponse.json({ ok: true, id: event.id, type: event.type });
}
