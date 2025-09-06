import { NextRequest, NextResponse } from "next/server";
import { assertStripeMetadataPHIZero } from "@/lib/stripeGuard";
export const runtime = "edge";
export async function POST(req: NextRequest) {
  try {
    const sig = req.headers.get("stripe-signature") || "";
    if (!sig) return NextResponse.json({ ok:false, error:"missing signature" }, { status:400 });
    const body = await req.json().catch(() => ({}));
    const meta = body?.data?.object?.metadata || {};
    assertStripeMetadataPHIZero(meta);
    return NextResponse.json({ ok:true });
  } catch (e:any) {
    return NextResponse.json({ ok:false, error:e?.message || "bad request" }, { status:400 });
  }
}
