import { NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';
export async function GET() {
  return NextResponse.json({ ok: true, route: '/api/ping', ts: Date.now() });
}
