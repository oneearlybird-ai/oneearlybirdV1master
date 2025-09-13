import http from 'http';
import crypto from 'crypto';
import { WebSocketServer, WebSocket } from 'ws';

const PORT = Number(process.env.PORT || 8080);
const WS_PATH = process.env.WS_PATH || '/rtm/voice';
const AUTH_TOKEN = process.env.MEDIA_AUTH_TOKEN || '';

const server = http.createServer((req, res) => {
  const { url } = req;
  const pathname = (() => {
    try { return new URL(url || '/', 'http://localhost').pathname; } catch { return '/'; }
  })();

  if (pathname === '/') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ ok: true, service: 'media', wsPath: WS_PATH, time: new Date().toISOString() }));
    return;
  }
  if (pathname === '/metrics') {
    res.writeHead(200, { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' });
    const now = Date.now();
    res.end(JSON.stringify({
      ok: true,
      time: new Date(now).toISOString(),
      fps10s: metrics.fps10s,
      frames10s: metrics.frames10s,
      backpressureCount10m: metrics.backpressure10m,
      lastMsgAgoSec: metrics.lastMsgAt ? Math.round((now - metrics.lastMsgAt)/1000) : null,
      lastBackpressureAgoSec: metrics.lastBackpressureAt ? Math.round((now - metrics.lastBackpressureAt)/1000) : null,
    }));
    return;
  }
  res.writeHead(404, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ ok: false, error: 'not_found' }));
});

const wss = new WebSocketServer({ server, path: WS_PATH });

// lightweight metrics for autoscaling decisions (no PHI)
const metrics = { frames10s: 0, fps10s: 0, lastMsgAt: 0, backpressure10m: 0, lastBackpressureAt: 0 };
setInterval(() => {
  metrics.fps10s = Math.round(metrics.frames10s / 10);
  metrics.frames10s = 0;
  if (metrics.backpressure10m > 0) metrics.backpressure10m -= 1; // decay over ~10 minutes
}, 10_000);

function safeJsonParse(buf) {
  try {
    return JSON.parse(buf.toString());
  } catch {
    return null;
  }
}

function nanoid(n = 10) {
  return crypto.randomBytes(n).toString('base64url');
}

// Minimal stub for future ElevenLabs realtime session wiring
class ElevenLabsSession {
  constructor(opts) {
    this.opts = opts;
    this.ws = null;
    this.connected = false;
  }
  async connect() {
    const url = process.env.ELEVENLABS_WS_URL || this.opts?.url;
    const apiKey = process.env.ELEVENLABS_API_KEY || this.opts?.apiKey;
    if (!url || !apiKey) return; // not configured; remain disconnected
    this.ws = new WebSocket(url, { headers: { 'xi-api-key': apiKey } });
    this.ws.on('open', () => { this.connected = true; });
    this.ws.on('close', () => { this.connected = false; });
    this.ws.on('error', () => { /* ignore */ return; });
  }
  async sendAudio(pcm16leBuffer) {
    if (!this.connected || !this.ws) return;
    if (process.env.EL_FORWARD_BINARY === 'true') {
      try { this.ws.send(pcm16leBuffer); } catch { /* drop on error */ }
    }
  }
  async close() {
    if (this.ws) { try { this.ws.close(); } catch (e) { void e; } }
    this.connected = false;
  }
}

wss.on('connection', async (ws, req) => {
  // Optional auth: prefer query param token=; fallback to header x-media-auth
  if (AUTH_TOKEN) {
    let ok = false;
    try {
      const u = new URL(req.url || '/', 'http://localhost');
      const qp = u.searchParams.get('token') || '';
      const hdr = (req.headers['x-media-auth'] || '').toString();
      ok = (qp && qp === AUTH_TOKEN) || (hdr && hdr === AUTH_TOKEN);
    } catch (e) { void e; }
    if (!ok) { try { ws.close(1008, 'policy violation'); } catch (e) { void e; } return; }
  }

  const connId = nanoid(8);
  let frames = 0;
  let streamSid = undefined;
  let lastMsgAt = Date.now();
  let keepalive = setInterval(() => {
    try { ws.ping(); } catch (e) { void e; }
    // Idle timeout: close if no messages for 30s
    if (Date.now() - lastMsgAt > 30000) { try { ws.close(1001, 'idle'); } catch (e) { void e; } }
    }, 15000);

  // Placeholder EL session (not connected by default)
  const el = new ElevenLabsSession({ apiKey: process.env.ELEVENLABS_API_KEY, agentId: process.env.ELEVENLABS_AGENT_ID, url: process.env.ELEVENLABS_WS_URL });

  function decodeMuLawToPCM16(mu) {
    // mu-law (G.711) decode: input Uint8Array -> Int16Array
    const out = new Int16Array(mu.length);
    for (let i = 0; i < mu.length; i++) {
      const u = mu[i] ^ 0xFF;
      const sign = u & 0x80;
      let exponent = (u >> 4) & 0x07;
      let mantissa = u & 0x0F;
      let sample = ((mantissa << 3) + 0x84) << exponent;
      sample -= 0x84;
      out[i] = sign ? -sample : sample;
    }
    return out;
  }

  function upsample8kTo16k(pcm8k) {
    // naive 2x linear upsample from 8k -> 16k
    const out = new Int16Array(pcm8k.length * 2);
    for (let i = 0; i < pcm8k.length - 1; i++) {
      const a = pcm8k[i];
      const b = pcm8k[i + 1];
      out[i * 2] = a;
      out[i * 2 + 1] = (a + b) >> 1;
    }
    if (pcm8k.length) {
      out[out.length - 2] = pcm8k[pcm8k.length - 1];
      out[out.length - 1] = pcm8k[pcm8k.length - 1];
    }
    return out;
  }

  function int16ToLEBytes(int16) {
    const buf = Buffer.allocUnsafe(int16.length * 2);
    for (let i = 0; i < int16.length; i++) buf.writeInt16LE(int16[i], i * 2);
    return buf;
  }

  ws.on('message', async (msg) => {
    // Twilio sends JSON events: { event: 'start'|'media'|'stop'|..., ... }
    const txt = Buffer.isBuffer(msg) ? msg.toString('utf8') : String(msg);
    lastMsgAt = Date.now();
    metrics.lastMsgAt = lastMsgAt;
    if (txt.toLowerCase() === 'ping') { ws.send('pong'); return; }
    const ev = safeJsonParse(txt);
    if (!ev || typeof ev.event !== 'string') return;

    switch (ev.event) {
      case 'start': {
        streamSid = ev.start?.streamSid || ev.streamSid || undefined;
        // No PHI logs; emit minimal structured signal
        process.stdout.write(`media:start id=${connId} sid=${streamSid || '-'}\n`);
        // Connect to ElevenLabs if configured
        await el.connect().catch(()=>{});
        break;
      }
      case 'media': {
        frames++;
        metrics.frames10s++;
        // ev.media.payload is base64 mulaw (8kHz) from Twilio
        if (el.connected) {
          try {
            const b = Buffer.from(ev.media?.payload || '', 'base64');
            // Guard max payload size (drop or close on abnormal input)
            if (b.byteLength > 16384) { try { ws.close(1009, 'payload too large'); } catch (e) { void e; } return; }
            const mu = new Uint8Array(b.buffer, b.byteOffset, b.byteLength);
            const pcm8k = decodeMuLawToPCM16(mu);
            const pcm16k = upsample8kTo16k(pcm8k);
            const le = int16ToLEBytes(pcm16k);
            await el.sendAudio(le);
          } catch { /* drop frame on error */ }
        }
        // Backpressure guard: if socket backed up, drop processing
        if (ws.bufferedAmount > 2_000_000) { try { ws.close(1009, 'backpressure'); } catch (e) { void e; }
          metrics.backpressure10m = Math.min(metrics.backpressure10m + 3, 60); // bump within decay window
          metrics.lastBackpressureAt = Date.now();
        }
        break;
      }
      case 'stop': {
        process.stdout.write(`media:stop id=${connId} frames=${frames}\n`);
        try { ws.close(1000, 'normal'); } catch (e) { void e; }
        break;
      }
      default:
        // ignore other event types (mark, dtmf, etc.)
        break;
    }
  });

  ws.on('close', async () => {
    clearInterval(keepalive);
    await el.close().catch(()=>{});
  });

  ws.on('error', () => { /* ignore */ return; });
});

server.listen(PORT, () => {
  process.stdout.write(`media:listening ${PORT} ${WS_PATH}\n`);
});
