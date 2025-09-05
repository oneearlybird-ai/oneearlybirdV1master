import { NextResponse, type NextRequest } from 'next/server';

// Apply basic security headers to all HTML/document requests.
// Static assets are left alone for perf/CDN compatibility.
export function middleware(req: NextRequest) {
  const res = NextResponse.next();

  // Only add to document navigations or SSR HTML
  const accept = req.headers.get('accept') || '';
  const isHTML = accept.includes('text/html') || accept.includes('*/*');

  if (isHTML) {
    res.headers.set('x-content-type-options', 'nosniff');
    res.headers.set('x-frame-options', 'SAMEORIGIN');
    res.headers.set('referrer-policy', 'strict-origin-when-cross-origin');
    res.headers.set('permissions-policy', [
      "camera=()",
      "microphone=()",
      "geolocation=()",
      "interest-cohort=()",
    ].join(', '));

    // A minimal CSP that still allows Next.js app-router, inline next-data, and same-origin assets.
    // We can tighten this further once we inventory third-party scripts.
    const csp = [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: blob:",
      "font-src 'self' data:",
      "connect-src 'self' https:",
      "frame-ancestors 'self'",
      "base-uri 'self'",
      "form-action 'self'",
    ].join('; ');
    res.headers.set('content-security-policy', csp);
  }

  return res;
}

export const config = {
  // Run on all routes; Next will skip static asset files automatically.
  matcher: ['/((?!_next|.*\\..*).*)'],
};
