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
  res.writeHead(404, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ ok: false, error: 'not_found' }));
});

const wss = new WebSocketServer({ server, path: WS_PATH });

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
    this.ws.on('error', () => { /* no noisy logs */ });
  }
  async sendAudio(pcm16leBuffer) {
    if (!this.connected || !this.ws) return;
    if (process.env.EL_FORWARD_BINARY === 'true') {
      try { this.ws.send(pcm16leBuffer); } catch { /* drop on error */ }
    }
  }
  async close() {
    if (this.ws) { try { this.ws.close(); } catch {} }
    this.connected = false;
  }
}

wss.on('connection', async (ws, req) => {
  // Optional auth: require header x-media-auth to match token if set
  if (AUTH_TOKEN) {
    const hdr = (req.headers['x-media-auth'] || '').toString();
    if (hdr !== AUTH_TOKEN) {
      try { ws.close(1008, 'policy violation'); } catch {}
      return;
    }
  }

  const connId = nanoid(8);
  let frames = 0;
  let started = false;
  let streamSid = undefined;
  let keepalive = setInterval(() => {
    try { ws.ping(); } catch {}
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
    if (txt.toLowerCase() === 'ping') { ws.send('pong'); return; }
    const ev = safeJsonParse(txt);
    if (!ev || typeof ev.event !== 'string') return;

    switch (ev.event) {
      case 'start': {
        started = true;
        streamSid = ev.start?.streamSid || ev.streamSid || undefined;
        // No PHI logs; emit minimal structured signal
        process.stdout.write(`media:start id=${connId} sid=${streamSid || '-'}\n`);
        // Connect to ElevenLabs if configured
        await el.connect().catch(()=>{});
        break;
      }
      case 'media': {
        frames++;
        // ev.media.payload is base64 mulaw (8kHz) from Twilio
        if (el.connected) {
          try {
            const b = Buffer.from(ev.media?.payload || '', 'base64');
            const mu = new Uint8Array(b.buffer, b.byteOffset, b.byteLength);
            const pcm8k = decodeMuLawToPCM16(mu);
            const pcm16k = upsample8kTo16k(pcm8k);
            const le = int16ToLEBytes(pcm16k);
            await el.sendAudio(le);
          } catch { /* drop frame on error */ }
        }
        // Backpressure guard: if socket backed up, drop processing
        if (ws.bufferedAmount > 1_000_000) {
          // drop frame silently
        }
        break;
      }
      case 'stop': {
        process.stdout.write(`media:stop id=${connId} frames=${frames}\n`);
        try { ws.close(1000, 'normal'); } catch {}
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

  ws.on('error', () => {
    // no-op; avoid noisy logs
  });
});

server.listen(PORT, () => {
  process.stdout.write(`media:listening ${PORT} ${WS_PATH}\n`);
});
