export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import crypto from "node:crypto";
import type { NextRequest } from "next/server";

function parseSig(h: string | null) {
  if (!h) return null;
  return h.split(",").reduce<Record<string,string>>((a, kv) => {
    const [k, v] = kv.split("=");
    if (k && v) a[k.trim()] = v.trim();
    return a;
  }, {});
}

function verify(body: string, header: string | null, secret?: string, maxSkew = 1800) {
  if (!secret) return false;
  const p = parseSig(header);
  if (!p?.t || !p?.v0) return false;
  const now = Math.floor(Date.now()/1000);
  if (Math.abs(now - Number(p.t)) > maxSkew) return false;
  const mac = crypto.createHmac("sha256", secret).update(`${p.t}.${body}`, "utf8").digest("hex");
  try { return crypto.timingSafeEqual(Buffer.from(p.v0, "hex"), Buffer.from(mac, "hex")); }
  catch { return false; }
}

export async function POST(req: NextRequest) {
  const t0 = Date.now();
  const secret = process.env.ELEVENLABS_WEBHOOK_SECRET;
  const sig = req.headers.get("elevenlabs-signature");
  const raw = await req.text(); // raw body for HMAC
  const ok = verify(raw, sig, secret);
  if (!ok) {
    console.info("[elevenlabs:personalization]", { ok: false, dur_ms: Date.now() - t0 });
    return new Response("invalid signature", { status: 401 });
  }
  // Minimal response to avoid latency; add overrides later if needed.
  const res = {};
    status: 200,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "no-store",
    },
  });
  console.info("[elevenlabs:personalization]", { ok: true, dur_ms: Date.now() - t0 });
  return out;
}

export async function GET() {
  return new Response(JSON.stringify({ status: "ok", handler: "elevenlabs-personalization" }), {
    status: 200,
    headers: { "content-type": "application/json; charset=utf-8" }
  });
}
