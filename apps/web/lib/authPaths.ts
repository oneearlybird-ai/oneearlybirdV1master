"use client";

import { toApiUrl } from "@/lib/http";

const DEFAULT_DESKTOP_HOST = "oneearlybird.ai";
const DEFAULT_MOBILE_HOST = "m.oneearlybird.ai";

function isMobileHostname(hostname: string): boolean {
  return hostname === DEFAULT_MOBILE_HOST || hostname.startsWith("m.");
}

function getCurrentHostname(): string {
  if (typeof window !== "undefined" && window.location?.hostname) {
    return window.location.hostname;
  }
  return DEFAULT_DESKTOP_HOST;
}

function getCurrentOrigin(): string {
  if (typeof window !== "undefined" && window.location?.origin) {
    return window.location.origin;
  }
  const hostname = getCurrentHostname();
  return `https://${hostname}`;
}

export function getDashboardPath(): string {
  const hostname = getCurrentHostname();
  return isMobileHostname(hostname) ? "/m/dashboard" : "/dashboard";
}

export function getLandingPath(): string {
  const hostname = getCurrentHostname();
  return isMobileHostname(hostname) ? "/m" : "/";
}

export function buildGoogleStartUrl(): string {
  const hostname = getCurrentHostname();
  const origin = getCurrentOrigin();
  const dashboardPath = isMobileHostname(hostname) ? "/m/dashboard" : "/dashboard";

  const params = new URLSearchParams({
    prompt: "select_account",
    return_host: hostname,
    return_path: dashboardPath,
    return_url: `${origin.replace(/\/+$/, "")}${dashboardPath}`,
  });

  return toApiUrl(`/oauth/google/start?${params.toString()}`);
}
