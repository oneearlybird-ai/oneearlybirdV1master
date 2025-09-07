import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  const res = NextResponse.next();

  // Generate a random nonce for inline scripts
  const nonce = Buffer.from(crypto.randomUUID()).toString("base64");

  res.headers.set(
    "Content-Security-Policy",
    `default-src 'self'; script-src 'self' 'nonce-<DYNAMIC>'; style-src 'self'; object-src 'none'; base-uri 'self'; frame-ancestors 'none';`
  );
  res.headers.set("X-Content-Type-Options", "nosniff");
  res.headers.set("X-Frame-Options", "DENY");
  res.headers.set("Strict-Transport-Security", "max-age=31536000; includeSubDomains; preload");
  res.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  res.headers.set("X-XSS-Protection", "1; mode=block");

  return res;
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
