export const runtime = "edge";

import { NextRequest } from "next/server";
import { proxyRequest } from "@/lib/server/proxy";

export async function GET(request: NextRequest) {
  return proxyRequest(request, { path: "/billing/summary" });
}
