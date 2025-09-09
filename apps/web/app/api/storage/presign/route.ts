import { NextRequest, NextResponse } from 'next/server'
import { getDownloadUrl, getUploadUrl } from '../../../../lib/server/s3'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

type Op = 'upload' | 'download'

function denied(reason = 'forbidden') {
  return NextResponse.json({ error: reason }, { status: 403 })
}

export async function POST(req: NextRequest) {
  if (!process.env.SMOKE_KEY) return denied('smoke key not configured')
  if (req.headers.get('x-smoke-key') !== process.env.SMOKE_KEY) return denied()

  let body: { key?: string; contentType?: string; op?: Op } = {}
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'invalid json' }, { status: 400 })
  }
  const { key, contentType, op } = body
  if (!key || !/^[A-Za-z0-9/_\-.]+$/.test(key) || key.includes('..')) {
    return NextResponse.json({ error: 'invalid key' }, { status: 400 })
  }
  if (op !== 'upload' && op !== 'download') {
    return NextResponse.json({ error: 'invalid op' }, { status: 400 })
  }

  try {
    if (op === 'upload') {
      const url = await getUploadUrl({ Key: key, ContentType: contentType })
      return NextResponse.json({ method: 'PUT', url }, { status: 200 })
    } else {
      const url = await getDownloadUrl({ Key: key })
      return NextResponse.json({ method: 'GET', url }, { status: 200 })
    }
  } catch (e) {
    return NextResponse.json({ error: 'presign failed' }, { status: 500 })
  }
}

