import { NextResponse } from "next/server";
import { appendAudit, makeAuditEvent } from "@/lib/audit";

export const runtime = "edge";

export async function POST() {
  const now = new Date().toISOString();
  const ev = makeAuditEvent("audit.test", { note: "edge audit test" });
  ev.actor = undefined;
  ev.details = { ...(ev.details || {}), ts: now, status: 200 };
  ev.at = now;

  const res = await appendAudit(ev);
  return NextResponse.json({ ok: true, sinkOk: res.ok, status: res.status ?? 0 });
}
