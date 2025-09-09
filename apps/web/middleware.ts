import { NextResponse, type NextRequest } from 'next/server';

export function middleware(_req: NextRequest) {
  const res = NextResponse.next();
  const nonce = Buffer.from(crypto.randomUUID()).toString('base64').replace(/=+$/,'');

  const csp = [
    "default-src 'self'",
    `script-src 'self' 'nonce-${nonce}'`,
    `style-src 'self' 'nonce-${nonce}'`,
    "img-src 'self' data: blob:",
    "font-src 'self' data:",
    "connect-src 'self' https: wss:",
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "object-src 'none'",
    "media-src 'self' blob: https:",
    "worker-src 'self' blob:"
  ].join('; ');

  res.headers.set('Content-Security-Policy', csp);
  res.headers.set('Strict-Transport-Security','max-age=63072000; includeSubDomains; preload');
  res.headers.set('Permissions-Policy','geolocation=(), camera=(), microphone=(), encrypted-media=(), fullscreen=(), payment=(), usb=(), xr-spatial-tracking=(), picture-in-picture=(), publickey-credentials-get=()');
  res.headers.set('Cross-Origin-Opener-Policy','same-origin');
  res.headers.set('Cross-Origin-Embedder-Policy','require-corp');
  res.headers.set('X-XSS-Protection','0');
  return res;
}

export const config = {
  matcher: '/:path*',
};
