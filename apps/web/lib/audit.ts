export type AuditEntry = {
  requestId: string;
  action: string;
  status: number;
  actor?: { id?: string; email?: string } | null;
  meta?: Record<string, unknown> | null;
  at?: number;
};

function toHex(b: Uint8Array) {
  return Array.from(b).map(x => x.toString(16).padStart(2, "0")).join("");
}

async function hmacSHA256(key: string, body: string) {
  const enc = new TextEncoder();
  const k = await crypto.subtle.importKey("raw", enc.encode(key), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const sig = await crypto.subtle.sign("HMAC", k, enc.encode(body));
  return toHex(new Uint8Array(sig));
}

/**
 * Append an audit entry to an external sink.
 * If AUDIT_LOG_WEBHOOK is unset, logs to console (non-fatal).
 * Payloads are HMAC-signed with AUDIT_LOG_SECRET for tamper evidence.
 */
export async function appendAudit(entry: AuditEntry): Promise<{ ok: boolean; mode: "webhook" | "console"; signature: string }> {
  const payload = JSON.stringify({ ...entry, at: entry.at ?? Date.now() });
  const secret = process.env.AUDIT_LOG_SECRET || "";
  const signature = secret ? await hmacSHA256(secret, payload) : "";

  const url = process.env.AUDIT_LOG_WEBHOOK;
  if (url) {
    try {
      const res = await fetch(url, {
        method: "POST",
        headers: {
          "content-type": "application/json",
          ...(signature ? { "x-audit-signature": signature } : {}),
        },
        body: payload,
        cache: "no-store",
      });
      return { ok: res.ok, mode: "webhook", signature };
    } catch (e) {
      // Fallthrough to console if webhook fails
    }
  }

  console.log(JSON.stringify({ level: "info", event: "audit_fallback", signature, payload: JSON.parse(payload) }));
  return { ok: true, mode: "console", signature };
}
