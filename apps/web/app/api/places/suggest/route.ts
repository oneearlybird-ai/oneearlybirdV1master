export const runtime = "edge";

import { NextRequest, NextResponse } from "next/server";
import { proxyRequest } from "@/lib/server/proxy";

export async function GET(request: NextRequest): Promise<NextResponse> {
  return proxyRequest(request, { path: "/places/suggest" });
}
