import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

function bad(msg: string, status = 400) {
  return NextResponse.json({ ok: false, error: msg }, { status, headers: { 'cache-control': 'no-store' } })
}

function maskTranscript(text: string) {
  return text
    .replace(/\b\d{3}[-.\s]?\d{2}[-.\s]?\d{4}\b/g, '***-**-****') // SSN-like
    .replace(/\b(?:\+?1[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}\b/g, '(***) ***-****') // phone
    .replace(/\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/gi, '***@***.***') // email
}

export async function GET(req: NextRequest) {
  const url = new URL(req.url)
  const id = (url.searchParams.get('id') || '').trim()
  if (!id) return bad('missing_id', 400)

  // Placeholder, PHI-safe mock based on id
  const startedAt = new Date(Date.now() - 15 * 60 * 1000).toISOString()
  const durationSec = 185
  const transcriptRaw = `Caller: Hi, I'm Alex from Example Co. My number is 415-555-2214.\nAgent: Hello Alex, thanks for calling EarlyBird! How can I help?\nCaller: I'd like to book a meeting for next Tuesday at 10am.`
  const transcript = maskTranscript(transcriptRaw)

  const body = {
    ok: true,
    id,
    startedAt,
    durationSec,
    audioUrl: null as string | null, // presigned URL will be provided later
    transcript,
    speakers: [
      { label: 'Caller', color: 'amber' },
      { label: 'Agent', color: 'cyan' },
    ],
  }
  return NextResponse.json(body, { status: 200, headers: { 'cache-control': 'no-store' } })
}

