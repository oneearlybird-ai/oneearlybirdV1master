import { NextResponse, NextRequest } from "next/server";
export function withSecurityHeaders(res: NextResponse) {
  res.headers.set("Strict-Transport-Security","max-age=31536000; includeSubDomains; preload");
  res.headers.set("X-Frame-Options","DENY");
  res.headers.set("Referrer-Policy","no-referrer");
  res.headers.set("X-Content-Type-Options","nosniff");
  res.headers.set("Permissions-Policy","geolocation=(), microphone=(), camera=()");
  return res;
}
export function withRequestId(req: NextRequest, res: NextResponse) {
  const id = crypto.randomUUID();
  res.headers.set("x-request-id", id);
  return res;
}
