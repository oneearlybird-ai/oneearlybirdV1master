export const runtime = "edge";

export async function GET() {
  if (process.env.NODE_ENV === "production") {
    return new Response("Not Found", { status: 404 });
  }
  try {
    const { Redis } = await import("@upstash/redis");
    const redis = Redis.fromEnv();
    await redis.ping();
    return new Response("OK", { status: 200 });
  } catch {
    return new Response("Upstash error", { status: 500 });
  }
}
