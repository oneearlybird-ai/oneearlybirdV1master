export const runtime = 'nodejs';

// DB-less health: returns 200 so the site is stable while we rewire storage
export async function GET() {
  return Response.json({
    ok: true,
    time: new Date().toISOString(),
    db: "disabled" // temporarily
  });
}
