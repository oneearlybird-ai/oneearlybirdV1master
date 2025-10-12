import { API_BASE } from "@/lib/config";

export type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE" | "HEAD" | "OPTIONS";
export interface HttpJson<T> { ok: boolean; data?: T; error?: string; }

export const API_BASE_PROD = "https://api.oneearlybird.ai";

export function isProdEnv(): boolean {
  const v = (process.env.NEXT_PUBLIC_VERCEL_ENV || process.env.VERCEL_ENV || process.env.NODE_ENV || "").toLowerCase();
  return v === "production";
}

function resolveBase(): string {
  if (API_BASE) return API_BASE.replace(/\/+$/, "");
  if (isProdEnv()) return API_BASE_PROD;
  return API_BASE_PROD;
}

function normalisePath(path: string): string {
  if (!path) return "/";
  if (/^https?:\/\//i.test(path)) return path;
  const prefixed = path.startsWith("/") ? path : `/${path}`;
  return prefixed.replace(/^\/api\//, "/");
}

export function toApiUrl(path: string): string {
  if (/^https?:\/\//i.test(path)) return path;
  const base = resolveBase();
  return `${base}${normalisePath(path)}`;
}

export async function apiFetch(path: string, init: RequestInit = {}): Promise<Response> {
  const url = toApiUrl(path);
  const headers = new Headers(init.headers as HeadersInit | undefined);
  const method = (init.method || "GET").toUpperCase();
  if (!headers.has("content-type") && method !== "GET" && method !== "HEAD") {
    headers.set("content-type", "application/json");
  }
  const merged: RequestInit = {
    ...init,
    credentials: "include",
    cache: init.cache ?? "no-store",
    headers,
  };
  return fetch(url, merged);
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
