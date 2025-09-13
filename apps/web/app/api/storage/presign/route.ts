import { NextRequest, NextResponse } from 'next/server'
import { getDownloadUrl, getUploadUrl } from '../../../../lib/storage/s3'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

type Op = 'upload' | 'download'

function denied(reason = 'forbidden') {
  return NextResponse.json({ error: reason }, { status: 403, headers: { 'cache-control': 'no-store' } })
}

function expectedEnv() {
  const ve = (process.env.VERCEL_ENV || '').toLowerCase()
  if (ve === 'production' || ve === 'preview' || ve === 'development') return ve
  return 'preview'
}

function parseKey(key: string) {
  const re = /^([a-z0-9-]+)\/tenants\/([A-Za-z0-9_-]{1,64})\/([A-Za-z0-9_-]{1,32})\/(\d{4})\/(\d{2})\/(\d{2})\/([A-Za-z0-9_-]{1,128})\.([A-Za-z0-9]{1,8})$/
  const m = key.match(re)
  if (!m) return null
  const [_, env, tenantId, type, yyyy, mm, dd, objectId, ext] = m
  const y = Number(yyyy), mo = Number(mm), d = Number(dd)
  if (!(mo >= 1 && mo <= 12) || !(d >= 1 && d <= 31)) return null
  return { env, tenantId, type, yyyy: y, mm: mo, dd: d, objectId, ext }
}

export async function POST(req: NextRequest) {
  if (!process.env.SMOKE_KEY) return denied('smoke key not configured')
  if (req.headers.get('x-smoke-key') !== process.env.SMOKE_KEY) return denied()

  let body: { key?: string; contentType?: string; op?: Op } = {}
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'invalid json' }, { status: 400, headers: { 'cache-control': 'no-store' } })
  }
  const { key, contentType, op } = body
  if (!key || !/^[A-Za-z0-9/_\-.]+$/.test(key) || key.includes('..')) {
    return NextResponse.json({ error: 'invalid key' }, { status: 400, headers: { 'cache-control': 'no-store' } })
  }
  const parsed = parseKey(key)
  if (!parsed) return NextResponse.json({ error: 'invalid key shape' }, { status: 400, headers: { 'cache-control': 'no-store' } })
  const envOk = parsed.env === expectedEnv() || (expectedEnv() === 'development' && parsed.env === 'preview')
  if (!envOk) return NextResponse.json({ error: 'env mismatch' }, { status: 400, headers: { 'cache-control': 'no-store' } })
  if (op !== 'upload' && op !== 'download') {
    return NextResponse.json({ error: 'invalid op' }, { status: 400, headers: { 'cache-control': 'no-store' } })
  }

  try {
    if (op === 'upload') {
      const url = await getUploadUrl({ Key: key, ContentType: contentType })
      return NextResponse.json({ method: 'PUT', url }, { status: 200, headers: { 'cache-control': 'no-store' } })
    } else {
      const url = await getDownloadUrl({ Key: key })
      return NextResponse.json({ method: 'GET', url }, { status: 200, headers: { 'cache-control': 'no-store' } })
    }
  } catch (_e) {
    return NextResponse.json({ error: 'presign failed' }, { status: 500, headers: { 'cache-control': 'no-store' } })
  }
}
