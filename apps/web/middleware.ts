import { NextResponse, type NextRequest } from "next/server";

const REPORTING_ENDPOINT = "csp-endpoint=\"https://reports.oneearlybird.ai/csp\"";

const CSP_DIRECTIVES = (
  nonce: string,
) => [
  "default-src 'self'",
  "base-uri 'none'",
  "object-src 'none'",
  `script-src 'self' 'nonce-${nonce}' https://js.stripe.com https://unpkg.com`,
  "script-src-attr 'none'",
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "img-src 'self' data: blob: https:",
  "font-src 'self' https://fonts.gstatic.com",
  "connect-src 'self' https://api.oneearlybird.ai",
  "frame-src 'self' https://js.stripe.com https://checkout.stripe.com https://accounts.google.com https://*.stripe.com",
  "frame-ancestors 'none'",
  "form-action 'self' https://checkout.stripe.com",
  "media-src 'self' https:"
].join("; ");

export function middleware(request: NextRequest) {
  const nonceArray = new Uint8Array(16);
  crypto.getRandomValues(nonceArray);
  const nonce = btoa(String.fromCharCode(...nonceArray));
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-nonce", nonce);

  const response = NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });

  response.headers.set("Content-Security-Policy-Report-Only", CSP_DIRECTIVES(nonce));
  response.headers.set("Reporting-Endpoints", REPORTING_ENDPOINT);
  response.headers.set("Cross-Origin-Opener-Policy", "same-origin-allow-popups");
  response.headers.set("Cross-Origin-Embedder-Policy", "unsafe-none");

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.png$|.*\\.jpg$|.*\\.jpeg$|.*\\.svg$|.*\\.ico$|.*\\.webmanifest$).*)",
  ],
};
