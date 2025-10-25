export const runtime = "edge";

import { NextRequest, NextResponse } from "next/server";
import { guardUpstream } from "@/lib/rate-limit";

const UPSTREAM = (process.env.API_UPSTREAM || process.env.API_BASE || "").replace(/\/\/+$/, "");

export async function GET(request: NextRequest): Promise<NextResponse> {
  return proxyToUpstream(request);
}

async function proxyToUpstream(request: NextRequest): Promise<NextResponse> {
  if (!UPSTREAM) {
    return NextResponse.json({ ok: false, error: "upstream_unconfigured" }, { status: 500 });
  }

  const guard = await guardUpstream(request);
  if (!guard.ok) {
    return new NextResponse("Too Many Requests", { status: 429, headers: guard.headers });
  }

  const target = new URL(`${UPSTREAM}/provisioning/status`);

  const init: RequestInit = {
    method: request.method,
    headers: stripHopByHop(request.headers),
    cache: "no-store",
    redirect: "manual",
  };

  const upstream = await fetch(target, init);
  const headers = new Headers(upstream.headers);
  headers.delete("transfer-encoding");

  return new NextResponse(upstream.body, { status: upstream.status, headers });
}

function stripHopByHop(headers: Headers): Headers {
  const output = new Headers(headers);
  [
    "connection",
    "keep-alive",
    "proxy-authenticate",
    "proxy-authorization",
    "te",
    "trailer",
    "transfer-encoding",
    "upgrade",
  ].forEach((key) => output.delete(key));
  return output;
}
