import { NextResponse } from 'next/server';

export async function GET() {
  const isPreview = process.env.VERCEL_ENV === 'preview' || process.env.NEXT_PUBLIC_VERCEL_ENV === 'preview';
  const body = isPreview ? 'User-agent: *\nDisallow: /\n' : 'User-agent: *\nAllow: /\n';
  return new NextResponse(body, {
    status: 200,
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=0, must-revalidate'
    }
  });
}
