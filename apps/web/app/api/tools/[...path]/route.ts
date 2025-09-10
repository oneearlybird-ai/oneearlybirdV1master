export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const MAX_BYTES = 32 * 1024

async function readJson(req: Request) {
  const ctype = (req.headers.get('content-type') || '').toLowerCase()
  if (!ctype.includes('application/json')) return { ok: false as const, status: 415, body: { error: 'unsupported_media_type' } }
  try {
    const buf = await req.arrayBuffer()
    if (buf.byteLength > MAX_BYTES) return { ok: false as const, status: 413, body: { error: 'payload_too_large' } }
    const json = JSON.parse(new TextDecoder().decode(buf))
    return json && typeof json === 'object' ? { ok: true as const, json } : { ok: false as const, status: 400, body: { error: 'invalid_json' } }
  } catch { return { ok: false as const, status: 400, body: { error: 'invalid_json' } } }
}

export async function POST(req: Request) {
  const parsed = await readJson(req)
  if (!parsed.ok) return new Response(JSON.stringify(parsed.body), { status: parsed.status, headers: { 'content-type': 'application/json; charset=utf-8' } })
  return new Response(JSON.stringify({ status: 'not_implemented', code: 501 }), { status: 501, headers: { 'content-type': 'application/json; charset=utf-8' } })
}

