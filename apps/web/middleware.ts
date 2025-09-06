import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const BYPASS = [/^\/api\/webhooks\/.*/i, /^\/api\/billing\/portal$/i];

export function middleware(req: NextRequest) {
  const { pathname } = new URL(req.url);

  for (const re of BYPASS) if (re.test(pathname)) return NextResponse.next();

  if (req.method !== "GET" && req.method !== "HEAD" && pathname.startsWith("/api/")) {
    const csrfHeader = req.headers.get("x-eb-csrf") || "";
    const csrfCookie = req.cookies.get("eb_csrf")?.value || "";
    if (!csrfHeader || !csrfCookie || csrfHeader !== csrfCookie) {
      return new NextResponse(JSON.stringify({ ok: false, error: "forbidden" }), {
        status: 403,
        headers: { "content-type": "application/json" },
      });
    }
  }
  return NextResponse.next();
}

export const config = { matcher: ["/api/:path*"] };
