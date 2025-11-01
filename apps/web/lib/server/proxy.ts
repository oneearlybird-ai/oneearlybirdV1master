import { NextRequest, NextResponse } from "next/server";
import { guardUpstream } from "@/lib/rate-limit";
import { getApiBase } from "@/lib/server/api-base";

export type ProxyOptions = {
  path: string;
  method?: string;
  includeBody?: boolean;
  forwardHeaders?: string[];
  extraHeaders?: Record<string, string>;
  injectSearchParams?: (target: URL, request: NextRequest) => void;
};

const DEFAULT_FORWARD_HEADERS = [
  "accept",
  "accept-language",
  "cookie",
  "user-agent",
  "authorization",
  "content-type",
  "x-forwarded-for",
  "x-forwarded-proto",
  "x-forwarded-host",
  "referer",
];

export async function proxyRequest(
  request: NextRequest,
  options: ProxyOptions,
): Promise<NextResponse> {
  const base = getApiBase();
  if (!base) {
    return NextResponse.json({ ok: false, error: "upstream_unconfigured" }, { status: 500 });
  }

  const guard = await guardUpstream(request);
  if (!guard.ok) {
    return new NextResponse("Too Many Requests", { status: 429, headers: guard.headers });
  }

  const method = (options.method ?? request.method).toUpperCase();
  const target = new URL(options.path.replace(/^\/+/, ""), base + "/");
  if (options.injectSearchParams) {
    options.injectSearchParams(target, request);
  } else {
    target.search = new URL(request.url).search;
  }

  const headers = buildHeaders(request, options.forwardHeaders, options.extraHeaders);

  const init: RequestInit = {
    method,
    headers,
    cache: "no-store",
    redirect: "manual",
    credentials: "include",
  };

  if (options.includeBody ?? (method !== "GET" && method !== "HEAD")) {
    init.body = request.body;
  }

  try {
    const upstream = await fetch(target, init);
    const responseHeaders = stripHopByHop(upstream.headers);
    return new NextResponse(upstream.body, { status: upstream.status, headers: responseHeaders });
  } catch (error) {
    console.error("proxy_request_error", {
      path: options.path,
      message: (error as Error)?.message ?? "unknown_error",
    });
    return NextResponse.json({ ok: false, error: "upstream_unreachable" }, { status: 502 });
  }
}

function buildHeaders(
  request: NextRequest,
  forwardHeaders?: string[],
  extraHeaders?: Record<string, string>,
): Headers {
  const finalForward = forwardHeaders ?? DEFAULT_FORWARD_HEADERS;
  const headers = new Headers();
  for (const key of finalForward) {
    const value = request.headers.get(key);
    if (value) {
      headers.set(key, value);
    }
  }

  if (extraHeaders) {
    for (const [key, value] of Object.entries(extraHeaders)) {
      headers.set(key, value);
    }
  }

  const originalForwarded = request.headers.get("x-forwarded-for") ?? request.headers.get("x-real-ip");
  if (originalForwarded) {
    const existing = headers.get("x-forwarded-for");
    const combined = existing ? `${existing}, ${originalForwarded}` : originalForwarded;
    headers.set("x-forwarded-for", combined);
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
