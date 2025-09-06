import { NextRequest, NextResponse } from "next/server";

const EXEMPT = ["/api/upstream/"];

function sameOrigin(req: NextRequest) {
  const origin = req.headers.get("origin");
  const host = req.headers.get("host");
  if (!origin || !host) return false;
  try {
    const o = new URL(origin);
    return o.host === host;
  } catch {
    return false;
  }
}

function needsProtection(pathname: string) {
  return !EXEMPT.some((p) => pathname.startsWith(p));
}

function getCookie(req: NextRequest, name: string) {
  return req.cookies.get(name)?.value ?? "";
}

function newToken() {
  const r = crypto.getRandomValues(new Uint8Array(16));
  return Array.from(r).map((b) => b.toString(16).padStart(2, "0")).join("");
}

function newRequestId() {
  const b = crypto.getRandomValues(new Uint8Array(16));
  b[6] = (b[6] & 0x0f) | 0x40;
  b[8] = (b[8] & 0x3f) | 0x80;
  const h = Array.from(b).map(x => x.toString(16).padStart(2, "0"));
  return `${h[0]}${h[1]}${h[2]}${h[3]}-${h[4]}${h[5]}-${h[6]}${h[7]}-${h[8]}${h[9]}-${h.slice(10).join("")}`;
}

function withReqId(res: NextResponse, id: string) {
  res.headers.set("x-request-id", id);
  return res;
}

function redactHeaders(h: Headers) {
  const copy: Record<string, string> = {};
  h.forEach((v, k) => {
    const key = k.toLowerCase();
    if (key === "authorization" || key === "cookie" || key === "x-eb-csrf") {
      copy[key] = "<redacted>";
    } else {
      copy[key] = v;
    }
  });
  return copy;
}

export function middleware(req: NextRequest) {
  const reqId = newRequestId();
  const { pathname } = req.nextUrl;
  const method = req.method.toUpperCase();

  if (method === "GET" || method === "HEAD" || method === "OPTIONS") {
    const res = NextResponse.next();
    if (!getCookie(req, "eb_csrf")) {
      res.cookies.set("eb_csrf", newToken(), {
        httpOnly: false,
        secure: true,
        sameSite: "strict",
        path: "/",
        maxAge: 60 * 60 * 24 * 2,
      });
    }
    console.log(JSON.stringify({ level: "info", event: "request", reqId, method, path: pathname, headers: redactHeaders(req.headers) }));
    return withReqId(res, reqId);
  }

  if (!needsProtection(pathname)) {
    const res = NextResponse.next();
    console.log(JSON.stringify({ level: "info", event: "request", reqId, method, path: pathname, headers: redactHeaders(req.headers), exempt: true }));
    return withReqId(res, reqId);
  }

  if (!(method === "POST" || method === "PUT" || method === "PATCH" || method === "DELETE")) {
    const res = NextResponse.next();
    console.log(JSON.stringify({ level: "info", event: "request", reqId, method, path: pathname, headers: redactHeaders(req.headers), note: "non-mutating" }));
    return withReqId(res, reqId);
  }

  if (!sameOrigin(req)) {
    const res = new NextResponse("Forbidden (origin)", { status: 403 });
    console.log(JSON.stringify({ level: "warn", event: "csrf_fail_origin", reqId, method, path: pathname }));
    return withReqId(res, reqId);
  }

  const cookie = getCookie(req, "eb_csrf");
  const header = req.headers.get("x-eb-csrf") || "";
  if (!cookie || !header || cookie !== header) {
    const res = new NextResponse("Forbidden (csrf)", { status: 403 });
    console.log(JSON.stringify({ level: "warn", event: "csrf_fail_token", reqId, method, path: pathname }));
    return withReqId(res, reqId);
  }

  const res = NextResponse.next();
  console.log(JSON.stringify({ level: "info", event: "csrf_pass", reqId, method, path: pathname }));
  return withReqId(res, reqId);
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml).*)"],
};
