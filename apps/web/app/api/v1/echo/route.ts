import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  const contentType = request.headers.get('content-type') || '';
  let body: unknown = null;

  try {
    if (contentType.includes('application/json')) {
      body = await request.json();
    } else if (contentType.includes('text/plain')) {
      body = await request.text();
    } else if (contentType.includes('application/x-www-form-urlencoded')) {
      const formData = await request.formData();
      body = Object.fromEntries(formData.entries());
    } else {
      body = await request.text();
    }
  } catch {
    return NextResponse.json({ ok: false, error: 'Invalid body' }, { status: 400 });
  }

  return NextResponse.json({
    ok: true,
    method: 'POST',
    body,
  });
}

export async function GET() {
  return NextResponse.json({ ok: true, method: 'GET' });
}
