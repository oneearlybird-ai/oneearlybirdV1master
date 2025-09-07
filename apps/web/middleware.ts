import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

function safeNonce(): string {
  try {
    if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
      return crypto.randomUUID();
    }
    // Fallback if randomUUID not available
    return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  } catch {
    return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  }
}

export function middleware(req: NextRequest) {
  const res = NextResponse.next();

  let nonce = "fallback";
  try {
    nonce = safeNonce();
  } catch {
    // keep fallback; do not throw in middleware
  }

  // Strict, Edge-safe CSP (no Buffer usage; true dynamic nonce)
  res.headers.set(
    "Content-Security-Policy",
    `default-src 'self'; script-src 'self' 'nonce-${nonce}'; style-src 'self'; object-src 'none'; base-uri 'self'; frame-ancestors 'none';`
  );

  // Security headers
  res.headers.set("X-Content-Type-Options", "nosniff");
  res.headers.set("X-Frame-Options", "DENY");
  res.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  res.headers.set("Strict-Transport-Security", "max-age=31536000; includeSubDomains; preload");

  
  res.headers.set("Permissions-Policy","geolocation=(), camera=(), microphone=(), encrypted-media=(), fullscreen=(), payment=(), usb=(), xr-spatial-tracking=(), picture-in-picture=(), publickey-credentials-get=()");

  
  try { res.headers.delete("X-Powered-By"); } catch {}
  try { res.headers.delete("Server"); } catch {}
res.headers.set("Cross-Origin-Opener-Policy","same-origin");
  res.headers.set("Cross-Origin-Embedder-Policy","require-corp");
return res;
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
