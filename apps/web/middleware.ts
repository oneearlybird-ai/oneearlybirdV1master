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

export function middleware(req: NextRequest) {
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
    return res;
  }

  if (!needsProtection(pathname)) {
    return NextResponse.next();
  }

  if (!(method === "POST" || method === "PUT" || method === "PATCH" || method === "DELETE")) {
    return NextResponse.next();
  }

  if (!sameOrigin(req)) {
    return new NextResponse("Forbidden (origin)", { status: 403 });
  }

  const cookie = getCookie(req, "eb_csrf");
  const header = req.headers.get("x-eb-csrf") || "";
  if (!cookie || !header || cookie !== header) {
    return new NextResponse("Forbidden (csrf)", { status: 403 });
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml).*)"],
};
