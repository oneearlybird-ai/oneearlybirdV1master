import { NextResponse, type NextRequest } from 'next/server';

// Generate a per-request nonce (token acceptable to browsers for CSP)
function generateNonce() {
  // randomUUID is available in the Edge runtime and sufficiently unpredictable for CSP nonces
  return crypto.randomUUID().replace(/-/g, '');
}

export function middleware(req: NextRequest) {
  const res = NextResponse.next();

  // Per-request nonce, forwarded to server components via a request header
  const nonce = generateNonce();
  const reqHeaders = new Headers(req.headers);
  reqHeaders.set('x-nonce', nonce);
  // Re-create response with updated request headers for downstream access
  const nextRes = NextResponse.next({ request: { headers: reqHeaders } });

  // Build strict CSP with nonces, no 'unsafe-inline'
  const csp = [
    "default-src 'self'",
    "base-uri 'self'",
    "frame-ancestors 'none'",
    "object-src 'none'",
    "img-src 'self' data: blob:",
    // Allow only self + nonce'd scripts; strict-dynamic lets trusted scripts load subresources
    `script-src 'self' 'strict-dynamic' 'nonce-${nonce}'`,
    // Styles: prefer nonced <style> blocks or external CSS; no unsafe-inline
    `style-src 'self' 'nonce-${nonce}'`,
    // Backend/API calls
    "connect-src 'self' https://earlybird-api.fly.dev https://*.vercel.app",
    "font-src 'self' data:",
    'upgrade-insecure-requests',
  ].join('; ');

  nextRes.headers.set('Content-Security-Policy', csp);
  nextRes.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  nextRes.headers.set('X-Content-Type-Options', 'nosniff');
  nextRes.headers.set('X-Frame-Options', 'DENY');
  nextRes.headers.set('X-DNS-Prefetch-Control', 'off');
  nextRes.headers.set(
    'Permissions-Policy',
    [
      'accelerometer=()',
      'autoplay=()',
      'camera=()',
      'display-capture=()',
      'fullscreen=()',
      'geolocation=()',
      'gyroscope=()',
      'microphone=()',
      'payment=()',
      'usb=()',
    ].join(', ')
  );
  nextRes.headers.set('Strict-Transport-Security', 'max-age=63072000; includeSubDomains; preload');
  nextRes.headers.set('Cache-Control', 'private, no-cache, no-store, max-age=0, must-revalidate');

  return nextRes;
}

export const config = {
  matcher: '/:path*',
};
