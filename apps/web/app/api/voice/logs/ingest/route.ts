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
  const sig = req.headers.get('x-twilio-signature') || ''
  const ct = (req.headers.get('content-type') || '').toLowerCase()
  const body = await req.text()

  let valid = true
  if (authToken && sig) {
    try {
      const mod: any = await import('twilio')
      const tw = (mod?.default ?? mod) as TwilioModule
      const url = absoluteUrlFrom(req)
      if (ct.includes('application/json')) valid = tw.validateRequestWithBody(authToken, sig, url, body)
      else {
        const params = Object.fromEntries(new URLSearchParams(body)) as Record<string, string>
        valid = tw.validateRequest(authToken, sig, url, params)
      }
    } catch { valid = false }
  }
  if (!valid) return new Response('forbidden', { status: 403, headers: { 'cache-control': 'no-store' } })

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
