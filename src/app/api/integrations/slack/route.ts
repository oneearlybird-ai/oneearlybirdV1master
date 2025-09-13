import { NextResponse } from 'next/server'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

function notImplemented() {
  return NextResponse.json(
    { ok: false, code: 'NOT_IMPLEMENTED', provider: 'slack' },
    { status: 501, headers: { 'cache-control': 'no-store' } }
  )
}

export async function GET() { return notImplemented() }
export async function POST() { return notImplemented() }

