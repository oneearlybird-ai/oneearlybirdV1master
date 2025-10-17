'use server';

import { cookies, headers } from "next/headers";
import { toApiUrl } from "./http";

export async function serverApiFetch(path: string, init: RequestInit = {}): Promise<Response> {
  const url = toApiUrl(path);
  const cookieStore = await cookies();
  const cookieHeader = cookieStore.getAll().map(({ name, value }) => `${name}=${value}`).join("; ");

  const incomingHeaders = await headers();
  const forwardedFor = incomingHeaders.get("x-forwarded-for");
  const forwardedProto = incomingHeaders.get("x-forwarded-proto");
  const forwardedHost = incomingHeaders.get("x-forwarded-host");

  const mergedHeaders = new Headers(init.headers ?? {});
  if (cookieHeader) mergedHeaders.set("cookie", cookieHeader);
  if (forwardedFor && !mergedHeaders.has("x-forwarded-for")) mergedHeaders.set("x-forwarded-for", forwardedFor);
  if (forwardedProto && !mergedHeaders.has("x-forwarded-proto")) mergedHeaders.set("x-forwarded-proto", forwardedProto);
  if (forwardedHost && !mergedHeaders.has("x-forwarded-host")) mergedHeaders.set("x-forwarded-host", forwardedHost);

  mergedHeaders.set("accept", mergedHeaders.get("accept") ?? "application/json");

  const response = await fetch(url, {
    ...init,
    headers: mergedHeaders,
    credentials: "include",
    cache: "no-store",
  });
  return response;
}
