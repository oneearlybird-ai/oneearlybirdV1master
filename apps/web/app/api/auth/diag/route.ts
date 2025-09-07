import { NextResponse } from "next/server";
export const runtime = "edge";
export async function GET(req: Request) {
  const url = new URL(req.url);
  const host = url.origin;
  const have = (k: string) => !!process.env[k] && process.env[k]!.trim().length>0;
  const redirectUri = host + "/api/auth/callback/google";
  return NextResponse.json({
    env: {
      NEXTAUTH_URL: process.env.NEXTAUTH_URL || null,
      HAVE_NEXTAUTH_SECRET: have("NEXTAUTH_SECRET"),
      HAVE_GOOGLE_CLIENT_ID: have("GOOGLE_CLIENT_ID"),
      HAVE_GOOGLE_CLIENT_SECRET: have("GOOGLE_CLIENT_SECRET")
    },
    computed: { redirectUri }
  });
}