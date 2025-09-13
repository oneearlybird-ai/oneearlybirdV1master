import { NextResponse } from 'next/server'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET() {
  return NextResponse.json(
    { ok: true, provider: 'slack', connected: false },
    { status: 200, headers: { 'cache-control': 'no-store' } }
  )
}

export async function POST() {
  return NextResponse.json(
    { ok: false, code: 'NOT_IMPLEMENTED', provider: 'slack' },
    { status: 501, headers: { 'cache-control': 'no-store' } }
  )
}
