import { NextResponse } from "next/server";
export const runtime = "edge";
export async function GET(): Promise<Response> {
  return NextResponse.json({ ok: true, time: new Date().toISOString() });
}
