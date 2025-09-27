export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

import type { NextRequest } from 'next/server'
import crypto from 'crypto'

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
  const evSecret = process.env.TWILIO_EVENT_STREAMS_SECRET || ''
  const ct = (req.headers.get('content-type') || '').toLowerCase()
  const body = await req.text()

  // Prefer Event Streams HMAC-SHA256 verification when a secret is configured
  const evSigHeader =
    req.headers.get('x-twilio-event-stream-signature') ||
    req.headers.get('x-twilio-eventstream-signature') || ''

  function timingEqual(a: Buffer, b: Buffer) {
    if (a.length !== b.length) return false
    try { return crypto.timingSafeEqual(a, b) } catch { return false }
  }

  let verified = true
  if (evSecret) {
    if (!evSigHeader) {
      verified = false
    } else {
      try {
        const mac = crypto.createHmac('sha256', evSecret).update(body, 'utf8').digest()
        const sigB64 = mac.toString('base64')
        const sigHex = mac.toString('hex')
        const sigB64u = sigB64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '')
        const got = evSigHeader.trim()
        // Accept base64, base64url, or hex encodings
        const candidates = [sigB64, sigB64u, sigHex]
        verified = candidates.some(c => timingEqual(Buffer.from(c), Buffer.from(got)))
      } catch {
        verified = false
      }
    }
  } else if (authToken) {
    // Fallback to classic Twilio webhook signature when Event Streams secret is not configured
    const sig = req.headers.get('x-twilio-signature') || ''
    if (sig) {
      try {
        const mod: any = await import('twilio')
        const tw = (mod?.default ?? mod) as TwilioModule
        const url = absoluteUrlFrom(req)
        if (ct.includes('application/json')) verified = tw.validateRequestWithBody(authToken, sig, url, body)
        else {
          const params = Object.fromEntries(new URLSearchParams(body)) as Record<string, string>
          verified = tw.validateRequest(authToken, sig, url, params)
        }
      } catch { verified = false }
    }
  }

  if (!verified) return new Response('forbidden', { status: 403, headers: { 'cache-control': 'no-store' } })

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
  try { console.info('[twilio:stream-status]', { event, len: body.length }) } catch (_e) { /* noop */ }

  return new Response('ok', { status: 200, headers: { 'cache-control': 'no-store' } })
}

export async function GET() {
  return new Response('ok', { status: 200, headers: { 'cache-control': 'no-store' } })
}
