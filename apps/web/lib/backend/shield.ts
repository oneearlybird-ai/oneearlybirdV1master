import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

type Handler = (req: NextRequest) => Promise<Response> | Response;

export const Env = (() => {
  const s = z.object({
    NODE_ENV: z.string().default('development'),
    NEXT_PUBLIC_ALLOWED_ORIGINS: z.string().optional(),
    API_MAX_BODY_KB: z.coerce.number().int().positive().default(100),
    UPSTASH_REDIS_REST_URL: z.string().url().optional(),
    UPSTASH_REDIS_REST_TOKEN: z.string().optional()
  });
  const parsed = s.parse({
    NODE_ENV: process.env.NODE_ENV,
    NEXT_PUBLIC_ALLOWED_ORIGINS: process.env.NEXT_PUBLIC_ALLOWED_ORIGINS,
    API_MAX_BODY_KB: process.env.API_MAX_BODY_KB,
    UPSTASH_REDIS_REST_URL: process.env.UPSTASH_REDIS_REST_URL,
    UPSTASH_REDIS_REST_TOKEN: process.env.UPSTASH_REDIS_REST_TOKEN
  });
  const origins = (parsed.NEXT_PUBLIC_ALLOWED_ORIGINS ?? '')
    .split(',')
    .map(o => o.trim())
    .filter(Boolean);
  return { ...parsed, ALLOWED_ORIGINS: origins };
})();

export function json(data: unknown, init: ResponseInit = {}) {
  return NextResponse.json({ ok: true, data }, { status: 200, ...init });
}
export function error(code: string, message: string, status = 400, meta?: unknown) {
  return NextResponse.json({ ok: false, error: { code, message, ...(meta ? { meta } : {}) } }, { status });
}

export function withCors(handler: Handler): Handler {
  return async (req: NextRequest) => {
    const origin = req.headers.get('origin') ?? '';
    const allow =
      !Env.ALLOWED_ORIGINS.length ||
      Env.ALLOWED_ORIGINS.some(o => o === origin);
    if (req.method === 'OPTIONS') {
      return new Response(null, {
        status: 204,
        headers: {
          'Access-Control-Allow-Origin': allow ? origin : 'null',
          'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
          'Access-Control-Allow-Headers': 'content-type,authorization',
          'Vary': 'Origin'
        }
      });
    }
    const res = await handler(req);
    const headers = new Headers(res.headers);
    headers.set('Vary', 'Origin');
    if (allow) headers.set('Access-Control-Allow-Origin', origin || '*');
    headers.set('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
    headers.set('Access-Control-Allow-Headers', 'content-type,authorization');
    return new Response(res.body, { status: res.status, headers });
  };
}

function clientIp(req: NextRequest) {
  return (
    req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    (req as unknown as { ip?: string }).ip ||
    '0.0.0.0'
  );
}

const mem = new Map<string, { count: number; exp: number }>();
function inMemoryLimit(key: string, max: number, windowSec: number) {
  const now = Date.now();
  const rec = mem.get(key);
  if (!rec || rec.exp < now) {
    mem.set(key, { count: 1, exp: now + windowSec * 1000 });
    return { allowed: true, remaining: max - 1 };
  }
  if (rec.count >= max) return { allowed: false, remaining: 0 };
  rec.count += 1;
  return { allowed: true, remaining: max - rec.count };
}

export function withRateLimit(handler: Handler, opts?: { points?: number; windowSec?: number; prefix?: string }): Handler {
  const points = opts?.points ?? 30;
  const windowSec = opts?.windowSec ?? 60;
  const prefix = opts?.prefix ?? 'rl:api';
  const useUpstash = !!(Env.UPSTASH_REDIS_REST_URL && Env.UPSTASH_REDIS_REST_TOKEN);
  const ratelimit = useUpstash
    ? new Ratelimit({
        redis: new Redis({
          url: Env.UPSTASH_REDIS_REST_URL!,
          token: Env.UPSTASH_REDIS_REST_TOKEN!
        }),
        limiter: Ratelimit.fixedWindow(points, `${windowSec} s`),
        analytics: false,
        prefix
      })
    : null;

  return async (req: NextRequest) => {
    const ip = clientIp(req);
    const key = `${prefix}:${ip}`;
    if (ratelimit) {
      const r = await ratelimit.limit(key);
      if (!r.success) {
        return error('rate_limited', 'Too Many Requests', 429, { retryAfter: r.reset });
      }
      return handler(req);
    } else {
      const r = inMemoryLimit(key, points, windowSec);
      if (!r.allowed) return error('rate_limited', 'Too Many Requests', 429);
      return handler(req);
    }
  };
}

export function withSizeLimit(handler: Handler): Handler {
  return async (req: NextRequest) => {
    const cl = Number(req.headers.get('content-length') || '0');
    const max = Env.API_MAX_BODY_KB * 1024;
    if (cl && cl > max) return error('payload_too_large', 'Request body too large', 413, { maxBytes: max });
    return handler(req);
  };
}

export function withJsonBody<T>(schema: z.ZodType<T>, handler: (req: NextRequest, body: T) => Promise<Response> | Response): Handler {
  return async (req: NextRequest) => {
    if (req.method !== 'POST') return error('method_not_allowed', 'Only POST allowed', 405);
    let body: unknown;
    try { body = await req.json(); }
    catch { return error('invalid_json', 'Malformed JSON body', 400); }
    const parsed = schema.safeParse(body);
    if (!parsed.success) return error('validation_error', 'Invalid body', 400, parsed.error.flatten());
    return handler(req, parsed.data);
  };
}

export function compose(...wrappers: ((h: Handler) => Handler)[]): (h: Handler) => Handler {
  return (h: Handler) => wrappers.reduceRight((acc, w) => w(acc), h);
}
