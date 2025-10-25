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

  const currentUrl = new URL(request.url);
  const target = new URL(`${UPSTREAM}/tenants/profile`);
  target.search = currentUrl.search;

  const init: RequestInit = {
    method: request.method,
    headers: buildUpstreamHeaders(request),
    cache: "no-store",
    redirect: "manual",
    credentials: "include",
  };

  if (request.method !== "GET" && request.method !== "HEAD") {
    init.body = request.body;
  }

  try {
    const upstream = await fetch(target, init);
    const headers = stripHopByHop(upstream.headers);
    return new NextResponse(upstream.body, { status: upstream.status, headers });
  } catch (error) {
    console.error("dashboard_profile_proxy_error", {
      message: (error as Error)?.message ?? "unknown_error",
    });
    return NextResponse.json({ ok: false, error: "upstream_unreachable" }, { status: 502 });
  }
}

function buildUpstreamHeaders(request: NextRequest): Headers {
  const headers = new Headers();
  const forward = (key: string) => {
    const value = request.headers.get(key);
    if (value) {
      headers.set(key, value);
    }
  };
  ["accept", "accept-language", "cookie", "user-agent"].forEach(forward);
  if (request.headers.has("content-type")) {
    headers.set("content-type", request.headers.get("content-type")!);
  }
  if (request.headers.has("authorization")) {
    headers.set("authorization", request.headers.get("authorization")!);
  }
  const forwardedFor = request.headers.get("x-forwarded-for");
  if (forwardedFor || request.ip) {
    const combined = [forwardedFor, request.ip].filter(Boolean).join(", ");
    if (combined) {
      headers.set("x-forwarded-for", combined);
    }
  }
  const forwardedProto = request.headers.get("x-forwarded-proto");
  if (forwardedProto) {
    headers.set("x-forwarded-proto", forwardedProto);
  }
  const forwardedHost = request.headers.get("x-forwarded-host") ?? request.headers.get("host");
  if (forwardedHost) {
    headers.set("x-forwarded-host", forwardedHost);
  }
  const referer = request.headers.get("referer");
  if (referer) {
    headers.set("referer", referer);
  }
  return headers;
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
