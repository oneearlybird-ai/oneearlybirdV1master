import Fastify from 'fastify';

const PORT = process.env.PORT || 8080;
const HOST = '0.0.0.0';

const app = Fastify({ logger: true });

// Deny-by-default security headers for API responses; strip server signature
app.addHook('onSend', async (_req, reply, payload) => {
  reply.header('Strict-Transport-Security', 'max-age=63072000; includeSubDomains; preload');
  reply.header('Permissions-Policy', 'geolocation=(), camera=(), microphone=(), encrypted-media=(), fullscreen=(), payment=(), usb=(), xr-spatial-tracking=(), picture-in-picture=(), publickey-credentials-get=()');
  reply.header('Cross-Origin-Opener-Policy', 'same-origin');
  reply.header('Cross-Origin-Embedder-Policy', 'require-corp');
  reply.header('X-Content-Type-Options', 'nosniff');
  reply.header('Referrer-Policy', 'strict-origin-when-cross-origin');
  try { reply.raw.removeHeader('Server'); } catch { void 0; }
  return payload;
});

app.get('/health', async () => ({ ok: true }));
app.get('/v1/ping', async () => ({ pong: true, ts: Date.now() }));
app.get('/status', async () => ({
  ok: true,
  service: 'earlybird-api',
  env: process.env.NODE_ENV || 'development',
  uptime_s: Math.floor(process.uptime()),
}));

// Usage summary placeholder (kept 200 for post-deploy smoke)
app.get('/api/usage/summary', async () => ({ ok: true, usage: [] }));

app.listen({ port: Number(PORT), host: HOST }).catch((err) => {
  app.log.error(err);
  process.exit(1);
});
