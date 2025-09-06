export const runtime = "edge";
import { NextRequest, NextResponse } from "next/server";
import { guardUpstream } from "@/lib/ratelimit";

const UPSTREAM = (process.env.API_UPSTREAM || "").replace(/\/+$/, "");
const PING_PATH = process.env.API_UPSTREAM_PING_PATH || "/health";

async function handle(req: NextRequest, method: string, params: { path?: string[] }) {
  const guard = await guardUpstream(req);
  if (!guard.ok) {
    return new NextResponse(JSON.stringify({ error: "Too Many Requests" }), { status: 429, headers: guard.headers });
  }

  const segs = params?.path?.length ? `/${params.path.join("/")}` : PING_PATH;
  const mapped = segs === "/ping" ? "/health" : segs;
  const url = `${UPSTREAM}${mapped}`;

  const fwdHeaders = new Headers(req.headers);
  fwdHeaders.delete("cookie");
  const host = req.headers.get("host");
  if (host) fwdHeaders.set("x-forwarded-host", host);

  const init: RequestInit = { method, headers: fwdHeaders, cache: "no-store" };
  if (method !== "GET" && method !== "HEAD") {
    init.body = req.body as any;
  }

  const upstream = await fetch(url, init);
  const outHeaders = new Headers(upstream.headers);
  guard.headers.forEach((v, k) => outHeaders.set(k, v));
  return new NextResponse(upstream.body, { status: upstream.status, headers: outHeaders });
}

export async function GET(req: NextRequest, ctx: { params: { path: string[] } }) { return handle(req, "GET", ctx.params); }
export async function POST(req: NextRequest, ctx: { params: { path: string[] } }) { return handle(req, "POST", ctx.params); }
export async function PUT(req: NextRequest, ctx: { params: { path: string[] } }) { return handle(req, "PUT", ctx.params); }
export async function PATCH(req: NextRequest, ctx: { params: { path: string[] } }) { return handle(req, "PATCH", ctx.params); }
export async function DELETE(req: NextRequest, ctx: { params: { path: string[] } }) { return handle(req, "DELETE", ctx.params); }
