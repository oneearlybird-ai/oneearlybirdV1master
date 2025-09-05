export const API_BASE =
  (typeof process !== 'undefined' && process.env.NEXT_PUBLIC_API_BASE) || '/api/upstream';

function join(a: string, b: string) {
  if (a.endsWith('/') && b.startsWith('/')) return a + b.slice(1);
  if (!a.endsWith('/') && !b.startsWith('/')) return a + '/' + b;
  return a + b;
}

/** JSON fetch helper that throws on non-2xx and returns parsed body. */
export async function apiFetch<T = any>(path: string, init: RequestInit = {}): Promise<T> {
  const url = join(API_BASE, path);
  const headers = new Headers(init.headers || {});
  if (!headers.has('content-type') && init.body) headers.set('content-type', 'application/json');

  const resp = await fetch(url, { ...init, headers, cache: 'no-store' });
  const text = await resp.text();
  const isJSON = (resp.headers.get('content-type') || '').includes('application/json');
  const data = isJSON && text ? JSON.parse(text) : (text as any);

  if (!resp.ok) {
    const msg = (data && (data.error || data.message)) || `HTTP ${resp.status}`;
    throw new Error(msg);
  }
  return data as T;
}
