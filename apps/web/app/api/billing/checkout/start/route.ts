export const runtime = "nodejs";

import { NextRequest } from "next/server";
import { proxyBillingRequest } from "@/lib/server/billingProxy";

export async function POST(req: NextRequest) {
  return proxyBillingRequest(req, "/billing/checkout/start");
}
