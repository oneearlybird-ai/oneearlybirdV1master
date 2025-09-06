import { NextResponse } from "next/server";
import { ZONE_MODE, HIPAA_MODE } from "../../../lib/config/swap";
export const runtime = "edge";
export async function GET() {
  return NextResponse.json({
    ok: true,
    zone: ZONE_MODE,
    hipaa: HIPAA_MODE,
    time: new Date().toISOString()
  });
}
