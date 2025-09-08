export type AuditEvent = { type: string; at: string; actor?: string; details?: Record<string, unknown> };

export function makeAuditEvent(type: string, details?: Record<string, unknown>, actor?: string): AuditEvent {
  return { type, at: new Date().toISOString(), actor, details };
}

async function hmacSha256Hex(secret: string, payload: string): Promise<string> {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    enc.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const sig = await crypto.subtle.sign("HMAC", key, enc.encode(payload));
  const bytes = Array.from(new Uint8Array(sig));
  return bytes.map(b => b.toString(16).padStart(2, "0")).join("");
}

/**
 * Append an audit event to the configured webhook sink.
 * No-ops safely if AUDIT_LOG_WEBHOOK is not set.
 */
export async function appendAudit(ev: AuditEvent): Promise<{ ok: boolean; status?: number }> {
  const url = process.env.AUDIT_LOG_WEBHOOK;
  if (!url) return { ok: false };

  const body = JSON.stringify(ev);
  const headers: Record<string, string> = { "content-type": "application/json" };
  const secret = process.env.AUDIT_LOG_SECRET || "";
  if (secret) {
    const hex = await hmacSha256Hex(secret, body);
    headers["x-audit-signature"] = `sha256=${hex}`;
  }

  const resp = await fetch(url, { method: "POST", headers, body, redirect: "manual", cache: "no-store" });
  return { ok: resp.ok, status: resp.status };
}
