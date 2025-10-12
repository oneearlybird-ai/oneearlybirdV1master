import { NextRequest, NextResponse } from "next/server";

const UPSTREAM = (process.env.API_UPSTREAM || "").replace(/\/+$/, "");

function base64UrlDecode(input: string): string {
  const normalized = input.replace(/-/g, "+").replace(/_/g, "/");
  const pad = normalized.length % 4 === 0 ? 0 : 4 - (normalized.length % 4);
  const padded = normalized + "=".repeat(pad);
  return Buffer.from(padded, "base64").toString("utf8");
}

function extractUserEmail(req: NextRequest): string | null {
  const token = req.cookies.get("id_token")?.value || req.cookies.get("access_token")?.value;
  if (!token) return null;
  const parts = token.split(".");
  if (parts.length < 2) return null;
  try {
    const payloadRaw = base64UrlDecode(parts[1]);
    const payload = JSON.parse(payloadRaw) as Record<string, unknown>;
    const email =
      (payload.email as string | undefined) ||
      (payload["custom:email"] as string | undefined) ||
      (payload.username as string | undefined) ||
      (payload["cognito:username"] as string | undefined) ||
      null;
    return email ? String(email) : null;
  } catch {
    return null;
  }
}

export async function proxyBillingRequest(req: NextRequest, targetPath: string): Promise<NextResponse> {
  if (!UPSTREAM) {
    return NextResponse.json({ ok: false, error: "billing_upstream_unconfigured" }, { status: 500 });
  }

  const userEmail = extractUserEmail(req);
  if (!userEmail) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }

  const bodyText = await req.text();
  const headers = new Headers();
  headers.set("content-type", "application/json");
  headers.set("x-user-email", userEmail);
  headers.set("x-user", userEmail);
  const cookie = req.headers.get("cookie");
  if (cookie) headers.set("cookie", cookie);

  const upstreamResponse = await fetch(`${UPSTREAM}${targetPath}`, {
    method: "POST",
    headers,
    body: bodyText,
    redirect: "manual",
    cache: "no-store",
  });

  const responseHeaders = new Headers(upstreamResponse.headers);
  responseHeaders.delete("transfer-encoding");

  const responseBody = await upstreamResponse.text();
  return new NextResponse(responseBody, {
    status: upstreamResponse.status,
    headers: responseHeaders,
  });
}
