import { NextRequest, NextResponse } from "next/server";
import { proxyRequest } from "@/lib/server/proxy";

export async function GET(request: NextRequest): Promise<NextResponse> {
  return proxyRequest(request, {
    path: "/tenants/profile",
    forwardHeaders: [
      "accept",
      "accept-language",
      "cookie",
      "user-agent",
      "authorization",
      "content-type",
      "x-forwarded-for",
      "x-forwarded-proto",
      "x-forwarded-host",
      "referer",
    ],
  });
}
