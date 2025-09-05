import { NextRequest, NextResponse } from 'next/server';

// --- Simple per-IP rate limit for /api/* --- //
const RATE_WINDOW_MS = 60_000; // 1 minute
const RATE_MAX = 120;          // 120 requests / min per IP
type Slot = { count: number; expires: number };
const buckets = new Map<string, Slot>();

function rateLimit(req: NextRequest): NextResponse | null {
  const p = req.nextUrl.pathname;
  if (!p.startsWith('/api/')) return null;

  // Get best-effort client IP
  const xf = req.headers.get('x-forwarded-for');
  const ip = req.ip ?? xf?.split(',')[0]?.trim() ?? 'unknown';

  const now = Date.now();
  const slot = buckets.get(ip);
  if (!slot || slot.expires < now) {
    buckets.set(ip, { count: 1, expires: now + RATE_WINDOW_MS });
    return null;
  }

  slot.count += 1;
  if (slot.count > RATE_MAX) {
    const res = new NextResponse('Too Many Requests', {
      status: 429,
      headers: { 'Retry-After': '60' },
    });
    // Minimal headers on throttle response
    res.headers.set('X-RateLimit-Limit', String(RATE_MAX));
    res.headers.set('X-RateLimit-Remaining', '0');
    return res;
  }

  buckets.set(ip, slot);
  return null;
}

export function middleware(req: NextRequest) {
  // 1) Apply API rate limit first
  const limited = rateLimit(req);
  if (limited) return limited;

  // 2) Continue request and set security headers
  const res = NextResponse.next();

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

  res.headers.set('Content-Security-Policy-Report-Only', csp);
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

  return res;
}

// Exclude Next internals & static assets
export const config = {
  matcher:
    '/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml).*)',
};
