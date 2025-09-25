import { NextResponse, type NextRequest } from 'next/server';
export function middleware(req: NextRequest) {
  // Auth gate for app dashboard (not preview). Simple cookie presence check.
  const p = req.nextUrl.pathname;
  if ((p === '/dashboard' || p.startsWith('/dashboard/')) && !p.startsWith('/dashboard-preview')) {
    const cookie = req.headers.get('cookie') || '';
    const has = /(^|;\s*)(__Secure-next-auth\.session-token|next-auth\.session-token)=/.test(cookie);
    if (!has) {
      const url = new URL('/login', req.url);
      return NextResponse.redirect(url);
    }
  }
  // Allow signed‑in users to view the marketing homepage (keep session + header Dashboard button)
  const res = NextResponse.next();
  const bytes = crypto.getRandomValues(new Uint8Array(16));
  const nonce = btoa(String.fromCharCode(...bytes)).replace(/=+$/, '');
  res.headers.set('x-nonce', nonce);
  // Path-scoped CSP: allow Plasmic Studio to frame only the /plasmic-host page
  const isPlasmicHost = p === '/plasmic-host';
  const isPlasmicRoute = isPlasmicHost || p === '/plasmic' || p.startsWith('/plasmic/');
  const frameAncestors = isPlasmicHost ? "frame-ancestors https://studio.plasmic.app" : "frame-ancestors 'none'";
  const coepValue = isPlasmicHost ? 'unsafe-none' : 'require-corp';
  const styleSrc = isPlasmicRoute
    ? `style-src 'self' 'nonce-${nonce}' 'unsafe-inline'`
    : `style-src 'self' 'nonce-${nonce}'`;
  const styleSrcElem = isPlasmicRoute
    ? `style-src-elem 'self' 'nonce-${nonce}' 'unsafe-inline'`
    : `style-src-elem 'self' 'nonce-${nonce}'`;
  const csp = [
    "default-src 'self'",
    `script-src 'self' 'nonce-${nonce}'`,
    styleSrc,
    styleSrcElem,
    "img-src 'self' data: blob:",
    "font-src 'self' data:",
    "connect-src 'self' https: wss:",
    frameAncestors,
    "base-uri 'self'",
    "form-action 'self'",
    "object-src 'none'",
    "media-src 'self' blob: https:",
    "worker-src 'self' blob:"
  ].join('; ');
  res.headers.set('Content-Security-Policy', csp);
  res.headers.set('Strict-Transport-Security','max-age=63072000; includeSubDomains; preload');
  res.headers.set('Permissions-Policy','geolocation=(), camera=(), microphone=(), encrypted-media=(), fullscreen=(), payment=(), usb=(), xr-spatial-tracking=(), picture-in-picture=(), publickey-credentials-get=()');
  res.headers.set('Cross-Origin-Opener-Policy', isPlasmicHost ? 'unsafe-none' : 'same-origin');
  res.headers.set('Cross-Origin-Embedder-Policy', coepValue);
  res.headers.set('X-Content-Type-Options','nosniff');
  res.headers.set('Referrer-Policy','strict-origin-when-cross-origin');
  res.headers.set('X-XSS-Protection','0');
  return res;
}
export const config = { matcher: '/:path*' };
