import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const PREFERRED_HOST = 'oneearlybird.ai';

// Don’t run middleware on these assets/routes
export const config = {
  matcher: [
    '/((?!_next/|favicon.ico|robots.txt|sitemap.xml|manifest.webmanifest|api/).*)',
  ],
};

export function middleware(req: NextRequest) {
  // Only enforce on production deployments
  if (process.env.VERCEL_ENV !== 'production') return NextResponse.next();

  const host = req.headers.get('host');
  if (!host || host === PREFERRED_HOST) return NextResponse.next();

  const url = new URL(req.url);
  url.hostname = PREFERRED_HOST;
  url.protocol = 'https:';
  return NextResponse.redirect(url, 308);
}
