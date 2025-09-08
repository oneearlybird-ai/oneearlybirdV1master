export type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE" | "HEAD" | "OPTIONS";
export interface HttpJson<T> { ok: boolean; data?: T; error?: string; }
export async function jsonFetch<T = unknown>(url: string, init: RequestInit = {}): Promise<HttpJson<T>> {
  const res = await fetch(url, init);
  try {
    const data = (await res.json()) as T;
    return { ok: res.ok, data, error: res.ok ? undefined : (data as unknown as { error?: string })?.error };
  } catch {
    return { ok: res.ok, error: res.statusText || "invalid json" };
  }
}
