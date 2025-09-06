import { NextRequest, NextResponse } from "next/server";
import { isPublicZone } from "../lib/config/swap";
export function enforcePublicPhiZero(req: NextRequest) {
  if (!isPublicZone) return null;
  const ctype = req.headers.get("content-type") || "";
  if (ctype.includes("json")) {
    return new Response(null);
  }
  return null;
}
