import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const MOBILE_UA = /Mobile|Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i;
const MOBILE_PREFIX = "/m";

function isAssetPath(pathname: string): boolean {
  return (
    pathname.startsWith("/api") ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon") ||
    pathname.startsWith("/fonts") ||
    pathname.includes(".")
  );
}

function normalizeMobilePath(pathname: string): string | null {
  if (pathname === "/" || pathname === "") return "/m";
  if (pathname.startsWith("/m")) return pathname;
  return `${MOBILE_PREFIX}${pathname}`;
}

function legacyMobilePath(pathname: string): string | null {
  if (pathname === "/" || pathname === "") return "/m";
  if (pathname.startsWith("/m")) return pathname;
  if (pathname.startsWith("/dashboard")) return `${MOBILE_PREFIX}${pathname}`;
  if (pathname.startsWith("/pricing")) return pathname.replace("/pricing", "/m/pricing");
  if (pathname === "/login") return "/m";
  return null;
}

export function middleware(request: NextRequest) {
  const url = request.nextUrl.clone();
  const pathname = url.pathname;
  const hostHeader = request.headers.get("host");
  const hostname = hostHeader ?? url.hostname;

  if (isAssetPath(pathname)) {
    return NextResponse.next();
  }

  const isMobileHost = hostname.toLowerCase().startsWith("m.");
  if (isMobileHost) {
    const targetPath = normalizeMobilePath(pathname);
    if (targetPath && targetPath !== pathname) {
      const rewriteUrl = request.nextUrl.clone();
      rewriteUrl.pathname = targetPath;
      return NextResponse.rewrite(rewriteUrl);
    }
    return NextResponse.next();
  }

  const desktopQuery = url.searchParams.get("desktop");
  const mobileQuery = url.searchParams.get("mobile");
  const hasDesktopCookie = request.cookies.get("eb_desktop")?.value === "1";
  const hasMobileCookie = request.cookies.get("eb_mobile")?.value === "1";

  if (desktopQuery === "1") {
    const cleaned = url.clone();
    cleaned.searchParams.delete("desktop");
    cleaned.searchParams.delete("mobile");
    const response = NextResponse.redirect(cleaned, 307);
    response.cookies.set("eb_desktop", "1", { path: "/", maxAge: 24 * 60 * 60 });
    response.cookies.delete("eb_mobile", { path: "/" });
    return response;
  }

  if (mobileQuery === "1") {
    const cleaned = url.clone();
    cleaned.searchParams.delete("desktop");
    cleaned.searchParams.delete("mobile");
    const mobilePath = legacyMobilePath(pathname) ?? normalizeMobilePath(pathname) ?? pathname;
    cleaned.pathname = mobilePath;
    const response = NextResponse.redirect(cleaned, 307);
    response.cookies.set("eb_mobile", "1", { path: "/", maxAge: 7 * 24 * 60 * 60 });
    response.cookies.delete("eb_desktop", { path: "/" });
    return response;
  }

  const userAgent = request.headers.get("user-agent") ?? "";
  const isMobileUa = MOBILE_UA.test(userAgent);
  const forceDesktop = hasDesktopCookie;
  const forceMobile = hasMobileCookie;

  if ((isMobileUa || forceMobile) && !forceDesktop) {
    const mobilePath = legacyMobilePath(pathname);
    if (mobilePath && mobilePath !== pathname) {
      const target = url.clone();
      target.pathname = mobilePath;
      const response = NextResponse.redirect(target, 307);
      if (forceMobile) {
        response.cookies.set("eb_mobile", "1", { path: "/", maxAge: 7 * 24 * 60 * 60 });
      }
      return response;
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next|api|static|.*\\..*).*)"],
};
