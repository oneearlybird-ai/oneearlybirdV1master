import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const MOBILE_UA = /Mobile|Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i;
const MOBILE_PREFIX = "/m";

function toMobilePath(pathname: string): string | null {
  if (pathname === "/" || pathname === "") return "/m";
  if (pathname.startsWith("/m")) return pathname;
  if (pathname.startsWith("/dashboard")) {
    return `${MOBILE_PREFIX}${pathname}`;
  }
  if (pathname.startsWith("/pricing")) {
    return pathname.replace("/pricing", "/m/pricing");
  }
  if (pathname === "/login") {
    return "/m";
  }
  return null;
}

export function middleware(request: NextRequest) {
  const { nextUrl } = request;
  const pathname = nextUrl.pathname;

  if (pathname.startsWith("/api") || pathname.startsWith("/_next") || pathname.includes(".")) {
    return NextResponse.next();
  }

  const urlWithoutQuery = nextUrl.clone();
  const searchParams = nextUrl.searchParams;
  const desktopQuery = searchParams.get("desktop");
  const mobileQuery = searchParams.get("mobile");
  const hasDesktopCookie = request.cookies.get("eb_desktop")?.value === "1";
  const hasMobileCookie = request.cookies.get("eb_mobile")?.value === "1";

  if (desktopQuery === "1") {
    const cleaned = urlWithoutQuery;
    cleaned.searchParams.delete("desktop");
    cleaned.searchParams.delete("mobile");
    const response = NextResponse.redirect(cleaned, 307);
    response.cookies.set("eb_desktop", "1", { path: "/", maxAge: 24 * 60 * 60 });
    response.cookies.delete("eb_mobile", { path: "/" });
    return response;
  }

  if (mobileQuery === "1") {
    const cleaned = urlWithoutQuery;
    cleaned.searchParams.delete("desktop");
    cleaned.searchParams.delete("mobile");
    const mobilePath = toMobilePath(pathname) ?? `${MOBILE_PREFIX}${pathname}`;
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
    const mobilePath = toMobilePath(pathname);
    if (mobilePath && mobilePath !== pathname) {
      const target = nextUrl.clone();
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
