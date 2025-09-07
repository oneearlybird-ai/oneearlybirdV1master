import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

const BYPASS = [/^\/api\/webhooks\/.*/i, /^\/api\/billing\/portal$/i];

export async function middleware(req: NextRequest) {
  const { pathname } = new URL(req.url);

  // Auth guard for dashboard (public zone, PHI-zero)
  if (pathname.startsWith("/dashboard")) {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    if (!token) {
      const url = new URL("/login", req.url);
      url.searchParams.set("next", pathname);
      return NextResponse.redirect(url);
    }
  }

  // API CSRF guard, with explicit exemptions
  if (pathname.startsWith("/api/")) {
    for (const re of BYPASS) if (re.test(pathname)) return NextResponse.next();

    if (req.method !== "GET" && req.method !== "HEAD") {
      const csrfHeader = req.headers.get("x-eb-csrf") || "";
      const csrfCookie = req.cookies.get("eb_csrf")?.value || "";
      if (!csrfHeader || !csrfCookie || csrfHeader !== csrfCookie) {
        return new NextResponse(JSON.stringify({ ok: false, error: "forbidden" }), {
          status: 403,
          headers: { "content-type": "application/json" },
        });
      }
    }
  }

  return NextResponse.next();
}

export const config = { matcher: ["/api/:path*", "/dashboard/:path*"] };
