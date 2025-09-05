import { NextResponse, type NextRequest } from 'next/server';

// Security headers applied to all routes (edge)
export function middleware(req: NextRequest) {
  const res = NextResponse.next();

  // Content-Security-Policy in Report-Only first to avoid breakage; we will enforce after verification.
  // Adjust endpoints / domains as needed if you add analytics, fonts, etc.
  const csp = [
    "default-src 'self'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
    "object-src 'none'",
    "img-src 'self' data: blob:",
    "script-src 'self' 'strict-dynamic' 'unsafe-inline'",
    "style-src 'self' 'unsafe-inline'",
    "connect-src 'self' https://earlybird-api.fly.dev https://*.vercel.app",
    "font-src 'self' data:",
    "upgrade-insecure-requests"
  ].join('; ');

  res.headers.set('Content-Security-Policy-Report-Only', csp);
  res.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.headers.set('X-Content-Type-Options', 'nosniff');
  res.headers.set('X-Frame-Options', 'DENY');
  res.headers.set('X-DNS-Prefetch-Control', 'off');
  res.headers.set('Permissions-Policy', [
    'accelerometer=()',
    'autoplay=()',
    'camera=()',
    'display-capture=()',
    'fullscreen=()',
    'geolocation=()',
    'gyroscope=()',
    'microphone=()',
    'payment=()',
    'usb=()'
  ].join(', '));

  return res;
}

// Exclude static assets and Next internals if desired; leaving broad for now.
// export const config = { matcher: '/:path*' };
