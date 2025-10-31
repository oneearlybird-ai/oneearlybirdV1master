import { API_BASE } from "@/lib/config";
import { apiFetch } from "@/lib/http";

let cachedToken: string | null | undefined;
let pendingTokenPromise: Promise<string | null> | null = null;

export async function fetchCsrfToken(): Promise<string | null> {
  if (cachedToken !== undefined) {
    return cachedToken;
  }
  if (API_BASE) {
    cachedToken = null;
    return null;
  }
  if (pendingTokenPromise) {
    return pendingTokenPromise;
  }
  pendingTokenPromise = (async () => {
    try {
      const response = await apiFetch("/auth/csrf", { cache: "no-store" });
      if (!response.ok) {
        if (response.status === 404) {
          console.warn("csrf_endpoint_missing");
          cachedToken = null;
          return null;
        }
        throw new Error(`csrf_fetch_failed_${response.status}`);
      }
      const json = (await response.json()) as { token?: string };
      if (!json?.token) {
        throw new Error("csrf_missing_token");
      }
      cachedToken = json.token;
      return cachedToken;
    } catch (error) {
      console.error("csrf_fetch_error", { message: (error as Error)?.message });
      cachedToken = null;
      return null;
    } finally {
      pendingTokenPromise = null;
    }
  })();
  return pendingTokenPromise;
}

export function invalidateCsrfToken(): void {
  cachedToken = undefined;
}

export async function startOtp(channel: "sms" | "call" | "email"): Promise<void> {
  const token = await fetchCsrfToken();
  const res = await apiFetch("/auth/otp/start", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      ...(token ? { "x-csrf-token": token } : {}),
    },
    body: JSON.stringify({ channel }),
  });
  if (res.status === 200) return;
  const payload = await res.json().catch(() => ({}));
  const code = typeof payload?.code === "string" ? payload.code : `otp_start_${res.status}`;
  throw Object.assign(new Error(code), { code });
}

export type VerifyOtpPayload =
  | { channel?: "sms" | "call"; code: string }
  | { channel?: "email"; token: string };

export async function verifyOtp(payload: VerifyOtpPayload): Promise<{ stepUpOkUntil?: string | null }> {
  const token = await fetchCsrfToken();
  const res = await apiFetch("/auth/otp/verify", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      ...(token ? { "x-csrf-token": token } : {}),
    },
    body: JSON.stringify(payload),
  });
  if (res.status === 200) {
    const json = (await res.json()) as { stepUpOkUntil?: string | null };
    return { stepUpOkUntil: json?.stepUpOkUntil ?? null };
  }
  const errorPayload = await res.json().catch(() => ({}));
  const code = typeof errorPayload?.code === "string" ? errorPayload.code : `otp_verify_${res.status}`;
  throw Object.assign(new Error(code), { code });
}
