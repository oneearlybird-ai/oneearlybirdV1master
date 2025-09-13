// ElevenLabs → EarlyBird: Post-call webhook (transcription/audio metadata)
// Security: Validates HMAC header `ElevenLabs-Signature` using shared secret.
// Env: ELEVENLABS_POSTCALL_WEBHOOK_SECRET
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import crypto from "node:crypto";
import type { NextRequest } from "next/server";

function timingSafeEqHex(aHex: string, bHex: string) {
  try {
    return crypto.timingSafeEqual(Buffer.from(aHex, "hex"), Buffer.from(bHex, "hex"));
  } catch {
    return false;
  }
}

function parseSig(h: string | null) {
  if (!h) return null;
  return h.split(",").reduce<Record<string, string>>((acc, kv) => {
    const [k, v] = kv.split("=");
    if (k && v) acc[k.trim()] = v.trim();
    return acc;
  }, {});
}

function verifyHmacWithTs(body: string, header: string | null, secret?: string, maxSkewSec = 1800) {
  if (!header || !secret) return false;
  const p = parseSig(header);
  const ts = p?.t;
  const v0 = p?.v0?.replace(/^v0=/, "");
  if (!ts || !v0) return false;
  const now = Math.floor(Date.now() / 1000);
  if (Math.abs(now - Number(ts)) > maxSkewSec) return false;
  const mac = crypto.createHmac("sha256", secret).update(`${ts}.${body}`, "utf8").digest("hex");
  return timingSafeEqHex(v0, mac);
}

export async function POST(req: NextRequest) {
  const t0 = Date.now();
  const secret = process.env.ELEVENLABS_POSTCALL_WEBHOOK_SECRET;
  const sigHeader = req.headers.get("elevenlabs-signature");
  const raw = await req.text(); // raw body required for HMAC

  if (!verifyHmacWithTs(raw, sigHeader, secret)) {
    console.info("[elevenlabs:post-call]", { ok: false, dur_ms: Date.now() - t0 });
    return new Response("invalid signature", { status: 403, headers: { 'cache-control': 'no-store' } });
  }

  // Minimal, PHI-safe parse (no transcript/audio echoed)
  let type = "unknown";
  let conversation_id: string | undefined;
  let agent_id: string | undefined;
  try {
    const body = JSON.parse(raw);
    type = body?.type ?? "unknown";
    conversation_id = body?.data?.conversation_id;
    agent_id = body?.data?.agent_id;
  } catch (_e) { /* ignore parse errors */ }

  console.info("[elevenlabs:post-call]", {
    ok: true,
    type,
    dur_ms: Date.now() - t0,
  });

  // Fast ACK; downstream processing happens out-of-band
  return new Response(
    JSON.stringify({ ok: true }),
    { status: 200, headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" } }
  );
}

export async function GET() {
  return new Response(JSON.stringify({ status: "ok", handler: "elevenlabs-post-call" }), {
    status: 200,
    headers: { "content-type": "application/json; charset=utf-8" },
  });
}
