import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

export function middleware(req: NextRequest) {
  const res = NextResponse.next();

  // Enforced Content Security Policy
  // Note: 'unsafe-inline' is kept for Next.js inline styles/scripts; we’ll progressively tighten later.
  const csp = [
    "default-src 'self'",
    "base-uri 'self'",
    "frame-ancestors 'none'",
    "object-src 'none'",
    "img-src 'self' data: blob:",
    "script-src 'self' 'strict-dynamic' 'unsafe-inline'",
    "style-src 'self' 'unsafe-inline'",
    "connect-src 'self' https://earlybird-api.fly.dev https://*.vercel.app",
    "font-src 'self' data:",
    'upgrade-insecure-requests',
  ].join('; ');

  res.headers.set('Content-Security-Policy', csp);
  res.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.headers.set('X-Content-Type-Options', 'nosniff');
  res.headers.set('X-Frame-Options', 'DENY');
  res.headers.set('X-DNS-Prefetch-Control', 'off');
  res.headers.set(
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
  res.headers.set('Strict-Transport-Security', 'max-age=63072000; includeSubDomains; preload');
  res.headers.set('Cache-Control', 'private, no-cache, no-store, max-age=0, must-revalidate');

  return res;
}

export const config = {
  // Apply to all paths
  matcher: '/:path*',
};
