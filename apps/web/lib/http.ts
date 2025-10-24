import { API_BASE } from "@/lib/config";
import { getMockResponse, shouldUseDashboardMocks } from "@/lib/dashboardMocks";

export type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE" | "HEAD" | "OPTIONS";
export interface HttpJson<T> { ok: boolean; data?: T; error?: string; }

export type ApiFetchInit = RequestInit & {
  suppressAuthRedirect?: boolean;
};

export const API_BASE_PROD = "https://api.oneearlybird.ai";

export function isProdEnv(): boolean {
  const v = (process.env.NEXT_PUBLIC_VERCEL_ENV || process.env.VERCEL_ENV || process.env.NODE_ENV || "").toLowerCase();
  return v === "production";
}

function resolveBase(): string {
  if (typeof window !== "undefined" && window.location?.origin) {
    return window.location.origin.replace(/\/+$/, "");
  }
  if (API_BASE) return API_BASE.replace(/\/+$/, "");
  const envBase = process.env.NEXT_PUBLIC_API_BASE_URL;
  if (envBase) return envBase.replace(/\/+$/, "");
  if (isProdEnv()) return API_BASE_PROD;
  return API_BASE_PROD;
}

function normalisePath(path: string): string {
  if (!path) return "/";
  if (/^https?:\/\//i.test(path)) return path;
  return path.startsWith("/") ? path : `/${path}`;
}

export function toApiUrl(path: string): string {
  if (/^https?:\/\//i.test(path)) return path;
  const base = resolveBase();
  return `${base}${normalisePath(path)}`;
}

export async function apiFetch(path: string, init: ApiFetchInit = {}): Promise<Response> {
  const { suppressAuthRedirect = false, ...rest } = init;
  const url = toApiUrl(path);
  if (shouldUseDashboardMocks()) {
    const mock = await getMockResponse(path, init);
    if (mock) {
      return mock;
    }
  }
  const headers = new Headers(rest.headers as HeadersInit | undefined);
  const method = (rest.method || "GET").toUpperCase();
  if (!headers.has("content-type") && method !== "GET" && method !== "HEAD") {
    headers.set("content-type", "application/json");
  }
  const merged: RequestInit = {
    ...rest,
    credentials: "include",
    cache: rest.cache ?? "no-store",
    headers,
  };
  const response = await fetch(url, merged);
  if (!suppressAuthRedirect && typeof window !== "undefined" && response.status === 401) {
    const currentPath = window.location.pathname || "";
    if (currentPath.startsWith("/dashboard")) {
      window.location.href = "/";
    } else if (currentPath === "/m" || currentPath.startsWith("/m/")) {
      window.location.href = "/m";
    }
  }
  return response;
}

export async function jsonFetch<T = unknown>(url: string, init: RequestInit = {}): Promise<HttpJson<T>> {
  const res = await fetch(url, init);
  try {
    const data = (await res.json()) as T;
    return { ok: res.ok, data, error: res.ok ? undefined : (data as unknown as { error?: string })?.error };
  } catch {
    return { ok: res.ok, error: res.statusText || "invalid json" };
  }
}
