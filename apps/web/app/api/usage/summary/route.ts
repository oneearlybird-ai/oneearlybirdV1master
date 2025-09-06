import { NextResponse } from "next/server";
import { isPublicZone } from "@/lib/config/swap";
export const runtime = "edge";
export async function GET() {
  if (!isPublicZone) {
    return NextResponse.json({ ok:false, error:"protected only" }, { status: 403 });
  }
  return NextResponse.json({ ok: true, calls: 0, minutes: 0, qualified: 0 });
}
