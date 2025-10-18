"use client";

const DEFAULT_DESKTOP_HOST = "oneearlybird.ai";
const DEFAULT_MOBILE_HOST = "m.oneearlybird.ai";
const GOOGLE_START_BASE = "https://api.oneearlybird.ai/oauth/google/start";

function isMobileHostname(hostname: string): boolean {
  return hostname === DEFAULT_MOBILE_HOST || hostname.startsWith("m.");
}

function getCurrentHostname(): string {
  if (typeof window !== "undefined" && window.location?.hostname) {
    return window.location.hostname;
  }
  return DEFAULT_DESKTOP_HOST;
}

export function getDashboardPath(): string {
  const hostname = getCurrentHostname();
  return isMobileHostname(hostname) ? "/m/dashboard" : "/dashboard";
}

export function getProfileCapturePath(): string {
  const hostname = getCurrentHostname();
  const path = typeof window !== "undefined" ? window.location?.pathname ?? "" : "";
  const mobileContext = isMobileHostname(hostname) || path.startsWith("/m/");
  return mobileContext ? "/m/profile-capture" : "/profile-capture";
}

export function getLandingPath(): string {
  const hostname = getCurrentHostname();
  return isMobileHostname(hostname) ? "/m" : "/";
}

export function getAccountCreatePath(): string {
  const hostname = getCurrentHostname();
  const path = typeof window !== "undefined" ? window.location?.pathname ?? "" : "";
  const mobileContext = isMobileHostname(hostname) || path.startsWith("/m/");
  return mobileContext ? "/m/account/create" : "/account/create";
}

export function getMagicVerifyPath(intent: "signin" | "signup"): string {
  const hostname = getCurrentHostname();
  const path = typeof window !== "undefined" ? window.location?.pathname ?? "" : "";
  const mobileContext = isMobileHostname(hostname) || path.startsWith("/m/");
  const base = mobileContext ? "/m/auth/magic/verify" : "/auth/magic/verify";
  return `${base}?intent=${intent}`;
}

type GoogleIntent = "signin" | "signup";

export function buildGoogleStartUrl(intent: GoogleIntent, options: { returnPath?: string } = {}): string {
  const hostname = getCurrentHostname();
  const path = typeof window !== "undefined" ? window.location?.pathname ?? "" : "";
  const mobileContext = isMobileHostname(hostname) || path.startsWith("/m/");
  const targetHost = mobileContext ? DEFAULT_MOBILE_HOST : DEFAULT_DESKTOP_HOST;
  const fallbackReturn = mobileContext
    ? intent === "signup"
      ? "/m/auth/oauth/google/signup"
      : "/m/auth/oauth/google/signin"
    : intent === "signup"
      ? "/auth/oauth/google/signup"
      : "/auth/oauth/google/signin";
  const returnPath = options.returnPath ?? fallbackReturn;
  const url = new URL(GOOGLE_START_BASE);
  url.searchParams.set("prompt", intent === "signup" ? "consent" : "select_account");
  url.searchParams.set("return_host", targetHost);
  url.searchParams.set("return_path", returnPath);
  url.searchParams.set("intent", intent);
  return url.toString();
}
