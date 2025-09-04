import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  return NextResponse.json({
    ok: true,
    service: 'web',
    time: new Date().toISOString(),
    env: process.env.VERCEL_ENV ?? 'local',
  });
}
