import { NextResponse } from 'next/server'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

type Item = { id: string; startedAt: string; durationSec: number; summary: string }

function make(page = 1, limit = 10): Item[] {
  const base: Item[] = [
    { id: 'r_1001', startedAt: new Date().toISOString(), durationSec: 185, summary: 'Booked meeting for next Tuesday 10am.' },
    { id: 'r_1000', startedAt: new Date(Date.now()-3600_000).toISOString(), durationSec: 126, summary: 'Qualified lead asking about pricing.' },
    { id: 'r_0999', startedAt: new Date(Date.now()-86400_000).toISOString(), durationSec: 18, summary: 'Voicemail left; follow-up needed.' },
  ]
  const out: Item[] = []
  for (let i = 0; i < limit; i++) {
    const b = base[i % base.length]
    out.push({ ...b, id: `${b.id}_${page}_${i}` })
  }
  return out
}

export async function GET(req: Request) {
  const url = new URL(req.url)
  const page = Math.max(1, parseInt(url.searchParams.get('page') || '1', 10) || 1)
  const limitRaw = parseInt(url.searchParams.get('limit') || '10', 10)
  const limit = Math.min(50, Math.max(1, isNaN(limitRaw) ? 10 : limitRaw))
  const rows = make(page, limit)
  return NextResponse.json({ ok: true, page, limit, rows }, { status: 200, headers: { 'cache-control': 'no-store' } })
}

