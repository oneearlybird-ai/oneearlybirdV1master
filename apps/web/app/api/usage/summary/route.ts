export const runtime = 'nodejs';

// DB-less, stable health (keeps site up even if DB is not wired)
export async function GET() {
  return Response.json({ ok: true, time: new Date().toISOString(), db: "disabled" });
}
