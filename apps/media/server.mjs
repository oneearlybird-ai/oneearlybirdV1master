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

// Simple µ-law codec + resampling helpers (inlined)
function decodeMuLawToPCM16(mu) {
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
function downsample16kTo8k(pcm16k) {
  const out = new Int16Array(Math.ceil(pcm16k.length / 2));
  for (let i = 0, j = 0; i < pcm16k.length; i += 2, j++) out[j] = pcm16k[i];
  return out;
}
function pcm16ToMuLaw(pcm) {
  const out = new Uint8Array(pcm.length);
  const BIAS = 0x84;
  const CLIP = 32635;
  for (let i = 0; i < pcm.length; i++) {
    let s = pcm[i];
    let sign = (s >> 8) & 0x80;
    if (sign !== 0) s = -s;
    if (s > CLIP) s = CLIP;
    s = s + BIAS;
    let exponent = 7;
    for (let expMask = 0x4000; (s & expMask) === 0 && exponent > 0; exponent--, expMask >>= 1) {}
    let mantissa = (s >> (exponent + 3)) & 0x0F;
    let uval = ~(sign | (exponent << 4) | mantissa) & 0xFF;
    out[i] = uval;
  }
  return out;
}
function int16ToLEBytes(int16) {
  const buf = Buffer.allocUnsafe(int16.length * 2);
  for (let i = 0; i < int16.length; i++) buf.writeInt16LE(int16[i], i * 2);
  return buf;
}
function leBytesToInt16(buf) {
  return new Int16Array(buf.buffer, buf.byteOffset, buf.byteLength >> 1);
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
    if (Date.now() - lastMsgAt > 30000) { try { ws.close(1001, 'idle'); } catch (e) { void e; } }
    }, 15000);

  const EL_URL = process.env.ELEVENLABS_WS_URL || process.env.ELEVEN_WS_URL || 'wss://api.elevenlabs.io/v1/convai/ws';
  const EL_API = process.env.ELEVENLABS_API_KEY || process.env.ELEVEN_API_KEY || '';
  const EL_AGENT = process.env.ELEVENLABS_AGENT_ID || process.env.ELEVEN_AGENT_ID || '';
  let vendor = null;
  function vendorConnect() {
    if (!EL_API) return;
    let url = EL_URL;
    if (EL_AGENT && !/agent_id=/.test(url)) {
      const sep = url.includes('?') ? '&' : '?';
      url = `${url}${sep}agent_id=${encodeURIComponent(EL_AGENT)}`;
    }
    vendor = new WebSocket(url, { headers: { 'xi-api-key': EL_API }, perMessageDeflate: false });
    vendor.on('message', (data, isBinary) => {
      if (!streamSid) return;
      if (isBinary && data?.length) {
        try {
          const pcm16k = leBytesToInt16(Buffer.from(data));
          const pcm8k = downsample16kTo8k(pcm16k);
          const mu = pcm16ToMuLaw(pcm8k);
          const b64 = Buffer.from(mu).toString('base64');
          ws.send(JSON.stringify({ event: 'media', streamSid, media: { payload: b64 } }));
        } catch { /* drop */ }
      }
    });
    vendor.on('close', () => { vendor = null; });
    vendor.on('error', () => { /* ignore */ });
  }
  if (EL_API) vendorConnect();

  ws.on('message', async (msg) => {
    const txt = Buffer.isBuffer(msg) ? msg.toString('utf8') : String(msg);
    lastMsgAt = Date.now();
    metrics.lastMsgAt = lastMsgAt;
    if (txt.toLowerCase() === 'ping') { ws.send('pong'); return; }
    const ev = safeJsonParse(txt);
    if (!ev || typeof ev.event !== 'string') return;

    switch (ev.event) {
      case 'start': {
        streamSid = ev.start?.streamSid || ev.streamSid || undefined;
        process.stdout.write(`media:start id=${connId} sid=${streamSid || '-'}\n`);
        if (!vendor && EL_API) vendorConnect();
        break;
      }
      case 'media': {
        frames++;
        metrics.frames10s++;
        try {
          const b = Buffer.from(ev.media?.payload || '', 'base64');
          if (b.byteLength > 16384) { try { ws.close(1009, 'payload too large'); } catch (e) { void e; } return; }
          const mu = new Uint8Array(b.buffer, b.byteOffset, b.byteLength);
          const pcm8k = decodeMuLawToPCM16(mu);
          const pcm16k = upsample8kTo16k(pcm8k);
          const le = int16ToLEBytes(pcm16k);
          if (vendor && vendor.readyState === WebSocket.OPEN) vendor.send(le);
        } catch { /* drop frame on error */ }
        if (ws.bufferedAmount > 2_000_000) { try { ws.close(1009, 'backpressure'); } catch (e) { void e; }
          metrics.backpressure10m = Math.min(metrics.backpressure10m + 3, 60);
          metrics.lastBackpressureAt = Date.now();
        }
        break;
      }
      case 'stop': {
        process.stdout.write(`media:stop id=${connId} frames=${frames}\n`);
        try { ws.close(1000, 'normal'); } catch (e) { void e; }
        try { vendor?.close(); } catch {}
        break;
      }
      default: break;
    }
  });

  ws.on('close', async () => {
    clearInterval(keepalive);
    try { vendor?.close(); } catch {}
  });

  ws.on('error', () => { /* ignore */ return; });
});

server.listen(PORT, () => {
  process.stdout.write(`media:listening ${PORT} ${WS_PATH}\n`);
});
