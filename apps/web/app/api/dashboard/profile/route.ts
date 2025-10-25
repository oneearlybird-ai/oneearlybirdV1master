import { headers } from "next/headers";
import { NextResponse } from "next/server";

const UPSTREAM = process.env.API_UPSTREAM?.replace(/\/+$/, "");

export async function GET() {
  if (!UPSTREAM) {
    return NextResponse.json({ error: "upstream_unconfigured" }, { status: 500 });
  }

  const incoming = headers();
  const cookie = incoming.get("cookie") ?? "";

  const response = await fetch(`${UPSTREAM}/tenants/profile`, {
    method: "GET",
    headers: {
      cookie,
      accept: "application/json",
    },
    cache: "no-store",
    credentials: "include",
  });

  if (!response.ok) {
    const body = await response.text();
    const contentType = response.headers.get("content-type") ?? "application/json";
    return new NextResponse(body || "", { status: response.status, headers: { "content-type": contentType } });
  }

  const json = await response.json().catch(() => ({}));
  return NextResponse.json(json, { status: 200 });
}
