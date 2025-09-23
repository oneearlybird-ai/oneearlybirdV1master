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
  if (pathname === '/health') {
    res.writeHead(200, { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' });
    res.end(JSON.stringify({ ok: true, service: 'media', time: new Date().toISOString() }));
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

const metrics = { frames10s: 0, fps10s: 0, lastMsgAt: 0, backpressure10m: 0, lastBackpressureAt: 0 };
setInterval(() => {
  metrics.fps10s = Math.round(metrics.frames10s / 10);
  metrics.frames10s = 0;
  if (metrics.backpressure10m > 0) metrics.backpressure10m -= 1;
}, 10_000);

function safeJsonParse(buf) { try { return JSON.parse(buf.toString()); } catch { return null; } }
function nanoid(n = 10) { return crypto.randomBytes(n).toString('base64url'); }

class ElevenLabsSession {
  constructor(opts) { this.opts = opts; this.ws = null; this.connected = false; }
  async connect() {
    const url = process.env.ELEVENLABS_WS_URL || this.opts?.url;
    const apiKey = process.env.ELEVENLABS_API_KEY || this.opts?.apiKey;
    if (!url || !apiKey) return;
    this.ws = new WebSocket(url, { headers: { 'xi-api-key': apiKey } });
    this.ws.on('open', () => { this.connected = true; });
    this.ws.on('close', () => { this.connected = false; });
    this.ws.on('message', (data) => {
      try {
        if (typeof this.onAudio !== 'function') return;
        if (Buffer.isBuffer(data)) {
          // Assume raw PCM16LE 16k from EL; forward to handler
          this.onAudio(data);
        } else {
          const txt = data.toString('utf8');
          // Try to parse JSON and extract base64 audio if present
          try {
            const obj = JSON.parse(txt);
            const b64 = obj?.audio || obj?.data?.audio;
            if (b64 && typeof b64 === 'string') {
              const buf = Buffer.from(b64, 'base64');
              this.onAudio(buf);
            }
          } catch (e) { void e; }
        }
      } catch (e) { void e; }
    });
  }
  async sendAudio(pcm16leBuffer) {
    if (!this.connected || !this.ws) return;
    if (process.env.EL_FORWARD_BINARY === 'true') { try { this.ws.send(pcm16leBuffer); } catch (e) { void e; } }
  }
  async close() { if (this.ws) { try { this.ws.close(); } catch (e) { void e; } } this.connected = false; }
}

wss.on('connection', async (ws, req) => {
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
  let keepalive = setInterval(() => { try { ws.ping(); } catch (e) { void e; } if (Date.now() - lastMsgAt > 30000) { try { ws.close(1001, 'idle'); } catch (e) { void e; } } }, 15000);

  const el = new ElevenLabsSession({ apiKey: process.env.ELEVENLABS_API_KEY, agentId: process.env.ELEVENLABS_AGENT_ID, url: process.env.ELEVENLABS_WS_URL });

  function decodeMuLawToPCM16(mu) {
    const out = new Int16Array(mu.length);
    for (let i = 0; i < mu.length; i++) {
      const u = mu[i] ^ 0xFF; const sign = u & 0x80; let exponent = (u >> 4) & 0x07; let mantissa = u & 0x0F; let sample = ((mantissa << 3) + 0x84) << exponent; sample -= 0x84; out[i] = sign ? -sample : sample;
    }
    return out;
  }
  function upsample8kTo16k(pcm8k) {
    const out = new Int16Array(pcm8k.length * 2);
    for (let i = 0; i < pcm8k.length - 1; i++) { const a = pcm8k[i]; const b = pcm8k[i + 1]; out[i * 2] = a; out[i * 2 + 1] = (a + b) >> 1; }
    if (pcm8k.length) { out[out.length - 2] = pcm8k[pcm8k.length - 1]; out[out.length - 1] = pcm8k[pcm8k.length - 1]; }
    return out;
  }
  function int16ToLEBytes(int16) { const buf = Buffer.allocUnsafe(int16.length * 2); for (let i = 0; i < int16.length; i++) buf.writeInt16LE(int16[i], i * 2); return buf; }

  function downsample16kTo8k(pcm16k) {
    // simple 2:1 decimation
    const out = new Int16Array(Math.floor(pcm16k.length / 2));
    for (let i = 0, j = 0; i + 1 < pcm16k.length; i += 2, j++) out[j] = pcm16k[i];
    return out;
  }

  function muLawEncodeSample(sample) {
    const MAX = 32635;
    let s = Math.max(-MAX, Math.min(MAX, sample));
    const sign = (s < 0) ? 0x80 : 0x00; if (s < 0) s = -s;
    let exponent = 7; { let expMask = 0x4000; while ((s & expMask) === 0 && exponent > 0) { exponent--; expMask >>= 1; } }
    const mantissa = (s >> ((exponent === 0) ? 4 : (exponent + 3))) & 0x0F;
    const mu = ~(sign | (exponent << 4) | mantissa) & 0xFF;
    return mu;
  }

  function pcm16ToMuLaw(pcm) {
    const out = Buffer.allocUnsafe(pcm.length);
    for (let i = 0; i < pcm.length; i++) out[i] = muLawEncodeSample(pcm[i]);
    return out;
  }

  ws.on('message', async (msg) => {
    const txt = Buffer.isBuffer(msg) ? msg.toString('utf8') : String(msg);
    lastMsgAt = Date.now(); metrics.lastMsgAt = lastMsgAt;
    if (txt.toLowerCase() === 'ping') { ws.send('pong'); return; }
    const ev = safeJsonParse(txt); if (!ev || typeof ev.event !== 'string') return;
    switch (ev.event) {
      case 'start': {
        streamSid = ev.start?.streamSid || ev.streamSid || undefined;
        process.stdout.write(`media:start id=${connId} sid=${streamSid || '-'}\n`);
        // Configure back-audio path from ElevenLabs to Twilio
        el.onAudio = (buf) => {
          try {
            if (!streamSid) return;
            // Expect buf as PCM16LE 16k; convert → 8k μ-law
            const samples = new Int16Array(buf.buffer, buf.byteOffset, Math.floor(buf.byteLength / 2));
            const pcm8k = downsample16kTo8k(samples);
            const mulaw = pcm16ToMuLaw(pcm8k);
            const payload = mulaw.toString('base64');
            const msg = JSON.stringify({ event: 'media', streamSid, media: { payload } });
            ws.send(msg);
          } catch (e) { void e; }
        };
        await el.connect().catch(()=>{});
        break; }
      case 'media': {
        frames++; metrics.frames10s++;
        if (el.connected) {
          try {
            const b = Buffer.from(ev.media?.payload || '', 'base64'); if (b.byteLength > 16384) { try { ws.close(1009, 'payload too large'); } catch (e) { void e; } return; }
            const mu = new Uint8Array(b.buffer, b.byteOffset, b.byteLength);
            const pcm8k = decodeMuLawToPCM16(mu); const pcm16k = upsample8kTo16k(pcm8k); const le = int16ToLEBytes(pcm16k);
            await el.sendAudio(le);
          } catch (e) { void e; }
        }
        if (ws.bufferedAmount > 2_000_000) { try { ws.close(1009, 'backpressure'); } catch (e) { void e; } metrics.backpressure10m = Math.min(metrics.backpressure10m + 3, 60); metrics.lastBackpressureAt = Date.now(); }
        break; }
      case 'stop': { process.stdout.write(`media:stop id=${connId} frames=${frames}\n`); try { ws.close(1000, 'normal'); } catch (e) { void e; } break; }
      default: break;
    }
  });

  ws.on('close', async () => { clearInterval(keepalive); await el.close().catch((e)=>{ void e; }); });
  ws.on('error', (e) => { void e; });
});

server.listen(PORT, () => { process.stdout.write(`media:listening ${PORT} ${WS_PATH}\n`); });
