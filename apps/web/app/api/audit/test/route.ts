export const runtime = "edge";
import { appendAudit } from "@/lib/audit";

export async function POST(req: Request) {
  const reqId = (req.headers.get("x-request-id") || "").toString();
  const now = Date.now();
  const res = await appendAudit({
    requestId: reqId || "unknown",
    action: "audit.test",
    status: 200,
    actor: undefined,
    meta: { ts: now, note: "edge audit test" },
    at: now,
  });

  return new Response(JSON.stringify({ ok: true, sink: res.mode, signature: res.signature }), {
    status: 200,
    headers: { "content-type": "application/json" },
  });
}
