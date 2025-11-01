export const runtime = "edge";

import { NextRequest } from "next/server";
import { proxyRequest } from "@/lib/server/proxy";

export async function GET(req: NextRequest, { params }: { params: { path: string[] } }) {
  return proxyDynamic(req, params);
}

export async function POST(req: NextRequest, { params }: { params: { path: string[] } }) {
  return proxyDynamic(req, params, { includeBody: true });
}

export async function PUT(req: NextRequest, { params }: { params: { path: string[] } }) {
  return proxyDynamic(req, params, { includeBody: true });
}

export async function PATCH(req: NextRequest, { params }: { params: { path: string[] } }) {
  return proxyDynamic(req, params, { includeBody: true });
}

export async function DELETE(req: NextRequest, { params }: { params: { path: string[] } }) {
  return proxyDynamic(req, params, { includeBody: true });
}

function buildPath(parts: string[]): string {
  return "/" + (parts?.join("/") ?? "");
}

async function proxyDynamic(
  req: NextRequest,
  { path }: { path: string[] },
  override?: { includeBody?: boolean },
) {
  return proxyRequest(req, {
    path: buildPath(path),
    includeBody: override?.includeBody,
  });
}
