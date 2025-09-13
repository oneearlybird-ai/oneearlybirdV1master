import { NextResponse } from 'next/server'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const providers = [
  { id: 'google-calendar', name: 'Google Calendar' },
  { id: 'calendly', name: 'Calendly' },
  { id: 'slack', name: 'Slack' },
  { id: 'hubspot', name: 'HubSpot' },
  { id: 'salesforce', name: 'Salesforce' },
]

export async function GET() {
  // Placeholder: all disconnected until OAuth wired
  return NextResponse.json(
    { ok: true, providers: providers.map(p => ({ ...p, connected: false })) },
    { status: 200, headers: { 'cache-control': 'no-store' } }
  )
}

