import { NextRequest, NextResponse } from "next/server";

const EXEMPT_S2S = /^\/api\/webhooks\/(stripe|twilio|ses|mailgun|sendgrid)(?:\/|$)/i;
const CSRF_HEADER = "x-eb-csrf";
const CSRF_COOKIE = "eb_csrf";

function setSecurityHeaders(res: NextResponse) {
  res.headers.set("Strict-Transport-Security","max-age=31536000; includeSubDomains; preload");
  res.headers.set("X-Frame-Options","DENY");
  res.headers.set("Referrer-Policy","no-referrer");
  res.headers.set("X-Content-Type-Options","nosniff");
  res.headers.set("Permissions-Policy","geolocation=(), microphone=(), camera=()");
  return res;
}

export function middleware(req: NextRequest) {
  const { pathname, origin } = req.nextUrl;
  const res = NextResponse.next();

  // Always attach a request id
  res.headers.set("x-request-id", crypto.randomUUID());

  // Exempt server-to-server webhooks from CSRF/origin checks
  if (EXEMPT_S2S.test(pathname)) {
    return setSecurityHeaders(res);
  }

  // Only enforce CSRF on state-changing methods
  const method = req.method.toUpperCase();
  const needsCSRF = method !== "GET" && method !== "HEAD" && method !== "OPTIONS";

  if (needsCSRF) {
    const reqOrigin = req.headers.get("origin") || "";
    if (reqOrigin !== origin) {
      return new NextResponse("Forbidden (origin)", { status: 403 });
    }
    const cookieCsrf = req.cookies.get(CSRF_COOKIE)?.value;
    const headerCsrf = req.headers.get(CSRF_HEADER) || "";
    if (!cookieCsrf || !headerCsrf || cookieCsrf !== headerCsrf) {
      return new NextResponse("Forbidden (csrf)", { status: 403 });
    }
  }

  return setSecurityHeaders(res);
}

export const config = {
  matcher: [
    // Apply to all paths except Next internals and static assets
    "/((?!_next/|favicon.ico|.*\\.(?:png|jpg|svg|css|js|ico|txt|map)$).*)"
  ],
};
