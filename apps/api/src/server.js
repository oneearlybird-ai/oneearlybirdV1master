import Fastify from 'fastify';

const PORT = process.env.PORT || 8080;
const HOST = '0.0.0.0';

const app = Fastify({ logger: true });

app.get('/health', async () => ({ ok: true }));
app.get('/v1/ping', async () => ({ pong: true, ts: Date.now() }));

app.listen({ port: Number(PORT), host: HOST }).catch((err) => {
  app.log.error(err);
  process.exit(1);
});
