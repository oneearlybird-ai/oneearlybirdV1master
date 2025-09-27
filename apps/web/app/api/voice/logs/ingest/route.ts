export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

import type { NextRequest } from 'next/server'

type TwilioModule = {
  validateRequest: (
    token: string,
    signature: string,
    url: string,
    params: Record<string, string>
  ) => boolean
  validateRequestWithBody: (
    token: string,
    signature: string,
    url: string,
    body: string
  ) => boolean
}

function absoluteUrlFrom(req: NextRequest): string {
  const u = new URL(req.url)
  const proto = (req.headers.get('x-forwarded-proto') ?? u.protocol.replace(':',''))
  const host  = (req.headers.get('x-forwarded-host')  ?? req.headers.get('host') ?? u.host)
  return `${proto}://${host}${u.pathname}`
}

export async function POST(req: NextRequest) {
  const authToken = process.env.TWILIO_AUTH_TOKEN || ''
  const logKey = process.env.VOICE_LOG_KEY || process.env.SMOKE_KEY || ''
  const bearer = (process.env.VOICE_LOG_BEARER || '').trim()
  const sig = req.headers.get('x-twilio-signature') || ''
  const hdrKey = req.headers.get('x-log-key') || req.headers.get('x-smoke-key') || ''
  const auth = req.headers.get('authorization') || ''
  const ct = (req.headers.get('content-type') || '').toLowerCase()
  const body = await req.text()

  // Accept if (in order):
  // 1) Twilio classic webhook signature validates (for status callbacks, etc.)
  // 2) x-log-key matches configured VOICE_LOG_KEY/SMOKE_KEY
  // 3) Authorization: Bearer <VOICE_LOG_BEARER>
  let accepted = false

  // 1) Twilio signature (optional)
  if (authToken && sig) {
    try {
      const mod: any = await import('twilio')
      const tw = (mod?.default ?? mod) as TwilioModule
      const url = absoluteUrlFrom(req)
      const ok = ct.includes('application/json')
        ? tw.validateRequestWithBody(authToken, sig, url, body)
        : tw.validateRequest(authToken, sig, url, Object.fromEntries(new URLSearchParams(body)))
      if (ok) accepted = true
    } catch { /* fallthrough */ }
  }

  // 2) x-log-key header
  if (!accepted && logKey && hdrKey === logKey) accepted = true

  // 3) Authorization: Bearer <token>
  if (!accepted && bearer && auth.toLowerCase().startsWith('bearer ')) {
    const tok = auth.slice(7).trim()
    if (tok && tok === bearer) accepted = true
  }

  if (!accepted) return new Response('forbidden', { status: 403, headers: { 'cache-control': 'no-store' } })

  // PHI-safe echo of event type only
  let event = 'unknown'
  try {
    if (ct.includes('application/json')) {
      const obj = JSON.parse(body)
      event = String(obj?.event || obj?.type || 'unknown')
    } else {
      const p = Object.fromEntries(new URLSearchParams(body)) as Record<string, string>
      event = p['event'] || p['type'] || 'unknown'
    }
  } catch (_e) { /* noop */ }
  try { console.info('[gw-log]', { event, len: body.length }) } catch (_e) { /* noop */ }

  return new Response('ok', { status: 200, headers: { 'cache-control': 'no-store' } })
}

export async function GET() {
  return new Response('ok', { status: 200, headers: { 'cache-control': 'no-store' } })
}
