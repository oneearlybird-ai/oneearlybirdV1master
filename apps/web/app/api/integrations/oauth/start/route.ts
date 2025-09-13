import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const ALLOWED = new Set(['google-calendar','calendly','slack','hubspot','salesforce'])

function notImplemented(provider?: string) {
  return NextResponse.json(
    { ok: false, code: 'NOT_IMPLEMENTED', provider, message: 'OAuth start flow not available yet' },
    { status: 501, headers: { 'cache-control': 'no-store' } }
  )
}

export async function GET() { return notImplemented() }

export async function POST(req: NextRequest) {
  const url = new URL(req.url)
  const provider = (url.searchParams.get('provider') || '').trim()
  if (!provider) {
    return NextResponse.json(
      { ok: false, code: 'MISSING_PROVIDER', message: 'missing query param: provider' },
      { status: 400, headers: { 'cache-control': 'no-store' } }
    )
  }
  if (!ALLOWED.has(provider)) {
    return NextResponse.json(
      { ok: false, code: 'UNKNOWN_PROVIDER', provider },
      { status: 400, headers: { 'cache-control': 'no-store' } }
    )
  }
  // Placeholder: when implemented, create OAuth session and return { url }
  return notImplemented(provider)
}
