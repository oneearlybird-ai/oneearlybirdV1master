import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const MOBILE_UA = /Mobile|Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i;
const PRIMARY_HOST = "oneearlybird.ai";

function isAssetPath(pathname: string): boolean {
  if (pathname.startsWith("/api/auth/")) return true;
  if (pathname.startsWith("/_next/")) return true;
  if (pathname === "/favicon.ico") return true;
  if (pathname.startsWith("/images")) return true;
  if (pathname.startsWith("/assets")) return true;
  if (pathname.startsWith("/api")) return true;
  if (pathname.startsWith("/_next")) return true;
  if (pathname.startsWith("/favicon")) return true;
  if (pathname.startsWith("/fonts")) return true;
  return pathname.includes(".");
}

function toMobileInternalPath(pathname: string): string {
  if (pathname === "/" || pathname === "") return "/m";
  if (pathname.startsWith("/m")) return pathname;
  return `/m${pathname}`;
}

export function middleware(request: NextRequest) {
  const url = request.nextUrl.clone();
  const pathname = url.pathname;
  const hostHeader = request.headers.get("host");
  const hostname = (hostHeader ?? url.hostname).toLowerCase();

  if (isAssetPath(pathname)) {
    return NextResponse.next();
  }

  const isMobileHost = hostname.startsWith("m.");

  if (isMobileHost) {
    const targetPath = toMobileInternalPath(pathname);
    if (targetPath !== pathname) {
      const rewriteUrl = request.nextUrl.clone();
      rewriteUrl.pathname = targetPath;
      return NextResponse.rewrite(rewriteUrl);
    }
    return NextResponse.next();
  }

  const desktopQuery = url.searchParams.get("desktop");
  const hasDesktopCookie = request.cookies.get("eb_desktop")?.value === "1";

  if (desktopQuery === "1") {
    const cleaned = url.clone();
    cleaned.searchParams.delete("desktop");
    const response = NextResponse.redirect(cleaned, 307);
    response.cookies.set("eb_desktop", "1", { path: "/", maxAge: 24 * 60 * 60 });
    return response;
  }

  const userAgent = request.headers.get("user-agent") ?? "";
  const isMobileUa = MOBILE_UA.test(userAgent);

  if (isMobileUa && !hasDesktopCookie) {
    const target = new URL(url.toString());
    target.hostname = `m.${PRIMARY_HOST}`;
    const response = NextResponse.redirect(target, 307);
    response.cookies.delete("eb_mobile", { path: "/" });
    return response;
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api/auth/|_next/|favicon\\.ico|images(?:/.*)?|assets(?:/.*)?|.*\\..*).*)"],
};
