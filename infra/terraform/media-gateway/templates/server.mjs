import http from 'http';
import crypto from 'crypto';
import { WebSocketServer, WebSocket } from 'ws';

const PORT = Number(process.env.PORT || 8080);
const WS_PATH = process.env.WS_PATH || '/rtm/voice';
const AUTH_TOKEN = process.env.MEDIA_AUTH_TOKEN || '';
const SHARED_SECRET = process.env.MEDIA_SHARED_SECRET || '';
const TWILIO_AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN || '';
const JWT_SKEW_SEC = Number(process.env.JWT_SKEW_SEC || 30);

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

// JWT utilities (HS256)
function b64uDecode(str) {
  const s = str.replace(/-/g, '+').replace(/_/g, '/');
  const pad = '==='.slice((s.length + 3) % 4);
  return Buffer.from(s + pad, 'base64');
}
function timingEqual(a, b) {
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
}
function verifyJwtHS256(token, secret, { aud, skewSec = 30 } = {}) {
  try {
    const parts = String(token).split('.');
    if (parts.length !== 3) return { ok: false, err: 'format' };
    const [h, p, s] = parts;
    const header = JSON.parse(b64uDecode(h).toString('utf8'));
    if (header.alg !== 'HS256') return { ok: false, err: 'alg' };
    const sig = b64uDecode(s);
    const expSig = crypto.createHmac('sha256', secret).update(`${h}.${p}`).digest();
    if (!timingEqual(sig, expSig)) return { ok: false, err: 'sig' };
    const payload = JSON.parse(b64uDecode(p).toString('utf8'));
    const now = Math.floor(Date.now() / 1000);
    if (typeof payload.iat === 'number' && payload.iat > now + skewSec) return { ok: false, err: 'iat' };
    if (typeof payload.nbf === 'number' && payload.nbf > now + skewSec) return { ok: false, err: 'nbf' };
    if (typeof payload.exp === 'number' && payload.exp < now - skewSec) return { ok: false, err: 'exp' };
    if (aud && payload.aud && payload.aud !== aud) return { ok: false, err: 'aud' };
    return { ok: true, payload };
  } catch {
    return { ok: false, err: 'exception' };
  }
}

// Twilio upgrade signature validation for Media Streams (recommended)
function validateTwilioUpgradeSignature(req) {
  try {
    if (!TWILIO_AUTH_TOKEN) return { ok: true, reason: 'no_auth_token' };
    const sig = String(req.headers['x-twilio-signature'] || '');
    // If Twilio does not send a signature on WS upgrade, allow and rely on JWT + event order
    if (!sig) return { ok: true, reason: 'no_signature' };
    const host = String(req.headers.host || '');
    const u0 = new URL(req.url || '/', `https://${host}`);
    const base = `wss://${host}${u0.pathname}`; // exact public WSS URL
    const keys = [...u0.searchParams.keys()].sort();
    let payload = base;
    for (const k of keys) payload += k + (u0.searchParams.get(k) || '');
    const expected = crypto.createHmac('sha1', TWILIO_AUTH_TOKEN).update(payload, 'utf8').digest('base64');
    const ok = timingEqual(Buffer.from(expected), Buffer.from(sig));
    return ok ? { ok: true } : { ok: false, reason: 'mismatch' };
  } catch {
    return { ok: false, reason: 'exception' };
  }
}

const wss = new WebSocketServer({ noServer: true, perMessageDeflate: false });

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
    let url = process.env.ELEVENLABS_WS_URL || this.opts?.url;
    const apiKey = process.env.ELEVENLABS_API_KEY || this.opts?.apiKey;
    const agentId = process.env.ELEVENLABS_AGENT_ID || this.opts?.agentId;
    if (!url || !apiKey) return;
    try {
      if (/^https?:/i.test(url)) {
        const u = new URL(url);
        if (!u.searchParams.get('agent_id') && agentId) u.searchParams.set('agent_id', agentId);
        const res = await fetch(u.toString(), { headers: { 'xi-api-key': apiKey } });
        if (!res.ok) throw new Error(`signed_url_http_${res.status}`);
        const j = await res.json();
        if (typeof j?.signed_url !== 'string') throw new Error('no_signed_url');
        url = j.signed_url;
      }
    } catch (e) { try { process.stdout.write(`el:signed_url_error ${(e&&e.message)||'err'}\n`); } catch (e2) { void e2; } }
    this.ws = new WebSocket(url, { headers: { 'xi-api-key': apiKey } });
    this.ws.on('open', () => { this.connected = true; try { process.stdout.write('el:open\n'); } catch (e) { void e; } });
    this.ws.on('close', (code, reason) => { this.connected = false; try { process.stdout.write(`el:close ${code} ${(reason||'').toString()}\n`); } catch (e) { void e; } });
    this.ws.on('unexpected-response', (_req, res) => { this.connected = false; try { process.stdout.write(`el:unexpected ${res.statusCode}\n`); } catch (e) { void e; } });
    this.ws.on('error', (e) => { this.connected = false; try { process.stdout.write(`el:error ${(e&&e.message)||'err'}\n`); } catch (e2) { void e2; } });
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
    let allowed = false;
    let mode = 'unknown';
    try {
      const u = new URL(req.url || '/', 'http://localhost');
      const qp = u.searchParams.get('token') || '';
      const hdr = (req.headers['x-media-auth'] || '').toString();
      const tok = qp || hdr;
      // Dual‑auth: accept valid JWT (if SHARED_SECRET) OR static token (if AUTH_TOKEN)
      if (SHARED_SECRET && tok && tok.includes('.')) {
        const v = verifyJwtHS256(tok, SHARED_SECRET, { aud: 'media', skewSec: JWT_SKEW_SEC });
        if (v.ok) { allowed = true; mode = 'jwt'; }
      }
      if (!allowed && AUTH_TOKEN && tok && tok === AUTH_TOKEN) { allowed = true; mode = 'token'; }
    } catch (e) { void e; }
    if (!allowed) { try { ws.close(1008, 'policy violation'); } catch (e) { void e; } return; }
    try { process.stdout.write(`auth:allow mode=${mode}\n`); } catch (e) { void e; }
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
    // Enforce Media Streams order: connected -> start -> media
    if (ev.event === 'connected') { ws.__gotConnected = true; return; }
    switch (ev.event) {
      case 'start': {
        if (!ws.__gotConnected) { try { ws.close(1008, 'connected_required'); } catch (e) { void e; } break; }
        streamSid = ev.start?.streamSid || ev.streamSid || undefined;
        // Enforce Twilio streamSid shape: MS + 32 hex
        if (!/^MS[a-f0-9]{32}$/i.test(String(streamSid || ''))) { try { ws.close(1008, 'invalid_streamSid'); } catch (e) { void e; } break; }
        process.stdout.write(`media:start id=${connId} sid=${streamSid || '-'}\n`);
        ws.__gotStart = true;
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
        if (!ws.__gotStart) { try { ws.close(1008, 'start_required'); } catch (e) { void e; } break; }
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

// Intercept HTTP upgrade to validate Twilio signature before accepting WebSocket
server.on('upgrade', (req, socket, head) => {
  try {
    const u = new URL(req.url || '/', 'http://localhost');
    const pathname = u.pathname;
    if (pathname !== WS_PATH) { try { socket.destroy(); } catch (e) { void e; } return; }
    const v = validateTwilioUpgradeSignature(req);
    if (!v.ok) { try { socket.destroy(); } catch (e) { void e; } return; }
    wss.handleUpgrade(req, socket, head, (ws) => { wss.emit('connection', ws, req); });
  } catch {
    try { socket.destroy(); } catch (e2) { void e2; }
  }
});

server.listen(PORT, () => { process.stdout.write(`media:listening ${PORT} ${WS_PATH}\n`); });
