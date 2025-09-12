// Tools Invoke Stub (permanent) — validates JSON and returns 202/501
// Guardrails:
//  - runtime=nodejs; dynamic (no caching)
//  - Strict JSON validation; clear errors; no PHI in logs
//  - Never executes tools here — this is a receipt/queue stub
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import type { NextRequest } from "next/server";

type ToolCall = {
  tool: string;                // e.g., "book_meeting" | "create_lead" | "kb_search" | "hours_check"
  args: Record<string, unknown>; // JSON-safe args; validated per tool
  request_id?: string;         // optional client correlation id
};

function bad(msg: string, details?: unknown, code = 400) {
  return new Response(
    JSON.stringify({ error: msg, details }),
    { status: code, headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" } }
  );
}

function ok202(jobId: string) {
  return new Response(
    JSON.stringify({ status: "accepted", job_id: jobId }),
    { status: 202, headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" } }
  );
}

// Minimal per-tool arg validation (tighten over time)
function validateToolPayload(payload: unknown): { ok: boolean; msg?: string } {
  if (!payload || typeof payload !== "object") return { ok: false, msg: "Body must be a JSON object." };
  const p = payload as ToolCall;
  if (!p.tool || typeof p.tool !== "string") return { ok: false, msg: "Missing or invalid 'tool' (string)." };
  if (!p.args || typeof p.args !== "object") return { ok: false, msg: "Missing or invalid 'args' (object)." };

  // Tighten known tools
  switch (p.tool) {
    case "book_meeting": {
      const { attendee_email, start_iso, duration_min } = p.args as Record<string, unknown>;
      if (typeof attendee_email !== "string" || !attendee_email.includes("@")) return { ok: false, msg: "book_meeting.attendee_email required" };
      if (typeof start_iso !== "string") return { ok: false, msg: "book_meeting.start_iso required" };
      if (typeof duration_min !== "number" || duration_min <= 0) return { ok: false, msg: "book_meeting.duration_min must be > 0" };
      break;
    }
    case "create_lead": {
      const { email } = p.args as Record<string, unknown>;
      if (typeof email !== "string" || !email.includes("@")) return { ok: false, msg: "create_lead.email required" };
      break;
    }
    case "kb_search": {
      const { query } = p.args as Record<string, unknown>;
      if (typeof query !== "string" || !query.trim()) return { ok: false, msg: "kb_search.query required" };
      break;
    }
    case "hours_check": {
      const { tz, when_iso } = p.args as Record<string, unknown>;
      if (typeof tz !== "string" || typeof when_iso !== "string") return { ok: false, msg: "hours_check.tz and when_iso required" };
      break;
    }
    default:
      // Future tools return 501 to prevent silent drift
      return { ok: false, msg: `Tool '${p.tool}' not implemented (501).` };
  }
  return { ok: true };
}

export async function POST(req: NextRequest) {
  // NOTE: authentication/authorization middleware should run globally per your guardrails.
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return bad("Invalid JSON body.");
  }
  const v = validateToolPayload(body);
  if (!v.ok) {
    // If tool is unknown, respond 501 (not implemented) instead of 400
    if (v.msg?.includes("not implemented")) return bad(v.msg, undefined, 501);
    return bad(v.msg || "Validation error.");
  }

  // Accept and hand off to background processor (not implemented here).
  // Generate a job id (Node 20+)
  const jobId = globalThis.crypto?.randomUUID?.() || `${Date.now()}-${Math.random().toString(16).slice(2)}`;
  return ok202(jobId);
}

export async function GET() {
  return new Response(
    JSON.stringify({ status: "ok", handler: "tools-invoke" }),
    { status: 200, headers: { "content-type": "application/json; charset=utf-8" } }
  );
}
