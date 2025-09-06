export const runtime = "edge";

export async function GET() {
  return new Response(JSON.stringify({ ok: true, ts: Date.now() }), {
    status: 200,
    headers: { "content-type": "application/json" },
  });
}

export async function POST() {
  // CSRF is enforced by middleware; if we reach here with matching token, allow.
  return new Response(JSON.stringify({ ok: true, ts: Date.now(), method: "POST" }), {
    status: 200,
    headers: { "content-type": "application/json" },
  });
}
