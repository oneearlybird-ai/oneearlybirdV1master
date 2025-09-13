import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

type CallItem = {
  id: string
  startedAt: string
  callerMasked: string
  outcome: 'booked' | 'qualified' | 'voicemail' | 'missed'
  sentiment: 'pos' | 'neu' | 'neg'
  durationSec: number
  costCents: number
}

function sample(page = 1, limit = 10): CallItem[] {
  const base: CallItem[] = [
    { id: 'c_1001', startedAt: new Date().toISOString(), callerMasked: '+1 (415) •••• 2214', outcome: 'booked', sentiment: 'pos', durationSec: 192, costCents: 42 },
    { id: 'c_1000', startedAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(), callerMasked: '+1 (510) •••• 8821', outcome: 'qualified', sentiment: 'neu', durationSec: 126, costCents: 31 },
    { id: 'c_0999', startedAt: new Date(Date.now() - 26 * 60 * 60 * 1000).toISOString(), callerMasked: '+1 (212) •••• 4470', outcome: 'voicemail', sentiment: 'neg', durationSec: 18, costCents: 3 },
  ]
  // simple repeat to fill page
  const out: CallItem[] = []
  for (let i = 0; i < limit; i++) {
    const b = base[i % base.length]
    out.push({ ...b, id: `${b.id}_${page}_${i}` })
  }
  return out
}

export async function GET(req: NextRequest) {
  const url = new URL(req.url)
  const page = Math.max(1, parseInt(url.searchParams.get('page') || '1', 10) || 1)
  const limitRaw = parseInt(url.searchParams.get('limit') || '10', 10)
  const limit = Math.min(50, Math.max(1, isNaN(limitRaw) ? 10 : limitRaw))

  const rows = sample(page, limit)
  return NextResponse.json({ ok: true, page, limit, rows }, { status: 200, headers: { 'cache-control': 'no-store' } })
}

