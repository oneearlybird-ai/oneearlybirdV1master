export type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE" | "HEAD" | "OPTIONS";
export interface HttpJson<T> { ok: boolean; data?: T; error?: string; }

// API base selection
export const API_BASE_PROD = "https://api.oneearlybird.ai";
export function isProdEnv(): boolean {
  const v = (process.env.NEXT_PUBLIC_VERCEL_ENV || process.env.VERCEL_ENV || process.env.NODE_ENV || "").toLowerCase();
  return v === "production";
}
export function toApiUrl(path: string): string {
  const rel = (path || "/").replace(/^\/?api\//, "/");
  return isProdEnv() ? API_BASE_PROD + rel : "/api/upstream" + rel;
}

export async function apiFetch(inputPath: string, init: RequestInit = {}): Promise<Response> {
  const url = toApiUrl(inputPath);
  const headers = new Headers(init.headers as HeadersInit | undefined);
  if (!headers.has("content-type") && (init.method || "GET").toUpperCase() !== "GET") {
    headers.set("content-type", "application/json");
  }
  const merged: RequestInit = { ...init, credentials: "include", headers };
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
