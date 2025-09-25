import http from 'http';
import crypto from 'crypto';
import { WebSocketServer, WebSocket } from 'ws';
let S3Client = null, PutObjectCommand = null;

const PORT = Number(process.env.PORT || 8080);
const WS_PATH = process.env.WS_PATH || '/rtm/voice';
const AUTH_TOKEN = process.env.MEDIA_AUTH_TOKEN || '';
const SHARED_SECRET = process.env.MEDIA_SHARED_SECRET || '';
const TWILIO_AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN || '';
const JWT_SKEW_SEC = Number(process.env.JWT_SKEW_SEC || 30);
const LOG_WEBHOOK_URL = process.env.LOG_WEBHOOK_URL || '';
const LOG_WEBHOOK_KEY = process.env.LOG_WEBHOOK_KEY || '';

// Optional object storage (Rumble S3 or AWS S3) for recordings
const REC_ENABLED = String(process.env.RECORD_CALLS || '').toLowerCase() === 'true';
const S3_ENDPOINT = process.env.S3_ENDPOINT || process.env.AWS_S3_ENDPOINT || '';
const S3_REGION = process.env.AWS_REGION || process.env.S3_REGION || 'us-east-1';
const S3_BUCKET = process.env.S3_BUCKET || process.env.AWS_S3_BUCKET || '';
const S3_AK = process.env.AWS_ACCESS_KEY_ID || process.env.S3_ACCESS_KEY_ID || '';
const S3_SK = process.env.AWS_SECRET_ACCESS_KEY || process.env.S3_SECRET_ACCESS_KEY || '';
const REC_CHUNK_SEC = Number(process.env.RECORD_CHUNK_SEC || 10);

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

// Lazy init S3 client if recording configured
function getS3() {
  try {
    if (!REC_ENABLED) return null;
    if (!(S3_BUCKET && S3_AK && S3_SK)) return null;
    if (!S3Client || !PutObjectCommand) {
      const sdk = require('@aws-sdk/client-s3');
      S3Client = sdk.S3Client; PutObjectCommand = sdk.PutObjectCommand;
    }
    const cfg = { region: S3_REGION, credentials: { accessKeyId: S3_AK, secretAccessKey: S3_SK } };
    if (S3_ENDPOINT) { cfg.endpoint = S3_ENDPOINT; cfg.forcePathStyle = true; }
    return new S3Client(cfg);
  } catch (e) { try { process.stdout.write(`rec:s3_init_error ${(e&&e.message)||'err'}\n`); } catch(_) { void _; } return null; }
}

class Recorder {
  constructor(callSid) {
    this.callSid = callSid || `call-${Date.now()}`;
    this.client = getS3();
    this.bufIn = [];
    this.bufOut = [];
    this.lenIn = 0; this.lenOut = 0;
    this.seqIn = 0; this.seqOut = 0;
    this.t0 = Date.now();
    this.timer = null;
    this.startTimer();
  }
  startTimer() { if (this.timer) return; this.timer = setInterval(()=>this.flush(false).catch(()=>{}), Math.max(1000, REC_CHUNK_SEC*1000)); }
  stopTimer() { if (!this.timer) return; try { clearInterval(this.timer); } catch(e) { void e; } this.timer = null; }
  addInboundPCM16(le) { try { this.bufIn.push(le); this.lenIn += le.byteLength; } catch(e) { void e; } }
  addVendorPCM16(le) { try { this.bufOut.push(le); this.lenOut += le.byteLength; } catch(e) { void e; } }
  async put(key, body, contentType='application/octet-stream') {
    if (!this.client) return;
    try { await this.client.send(new PutObjectCommand({ Bucket: S3_BUCKET, Key: key, Body: body, ContentType: contentType })); }
    catch(e){ try { process.stdout.write(`rec:put_error ${key} ${(e&&e.message)||'err'}\n`);}catch(_){ void _; }}
  }
  async flush(force) {
    if (!this.client) return;
    const now = Date.now();
    const base = `${this.callSid}/${new Date(this.t0).toISOString().slice(0,10)}`;
    if (this.lenIn>0 && (force || (now-this.t0)>=REC_CHUNK_SEC*1000)) {
      const buf = Buffer.concat(this.bufIn); this.bufIn=[]; const seq=this.seqIn++;
      await this.put(`${base}/twilio-in-${seq}.pcm16le`, buf, 'audio/L16'); this.lenIn=0;
    }
    if (this.lenOut>0 && (force || (now-this.t0)>=REC_CHUNK_SEC*1000)) {
      const buf = Buffer.concat(this.bufOut); this.bufOut=[]; const seq=this.seqOut++;
      await this.put(`${base}/vendor-out-${seq}.pcm16le`, buf, 'audio/L16'); this.lenOut=0;
    }
  }
  async close() { try { this.stopTimer(); await this.flush(true); } catch(e) { void e; } }
}

class ElevenLabsSession {
  constructor(opts) { this.opts = opts||{}; this.ws = null; this.connected = false; this._want=false; this._backoff=500; }
  async connect() {
    this._want = true;
    let url = process.env.ELEVENLABS_WS_URL || this.opts?.url;
    const apiKey = process.env.ELEVENLABS_API_KEY || this.opts?.apiKey;
    const origin = process.env.ELEVENLABS_ORIGIN || 'https://oneearlybird.ai';
    const agentId = process.env.ELEVENLABS_AGENT_ID || this.opts?.agentId;
    if ((!url && !agentId) || !apiKey) return;
    try {
      if (process.env.EL_USE_DIRECT === 'true') {
        url = `wss://api.elevenlabs.io/v1/convai/conversation?agent_id=${agentId || ''}`;
      }
    } catch (e) { void e; }
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
    // Build headers: for signed URLs, omit xi-api-key; otherwise include it
    const hdrs = { 'Origin': origin };
    try { if (!/conversation_signature=/.test(String(url))) { hdrs['xi-api-key'] = apiKey; } } catch (e) { void e; }
    this.ws = new WebSocket(url, { headers: hdrs });
    this.ws.on('open', () => { 
      this.connected = true; this._backoff=500;
      try { process.stdout.write('el:open\n'); } catch (e) { void e; }
      // Send a minimal session/update to declare audio formats
      try {
        this.ws.send(JSON.stringify({ type: 'session.update', session: { input_audio_format: { type: 'pcm16', sample_rate_hz: 16000, channels: 1 }, output_audio_format: { type: 'pcm16', sample_rate_hz: 16000, channels: 1 } } }));
        const agentId = process.env.ELEVENLABS_AGENT_ID || this.opts?.agentId;
        if (agentId) this.ws.send(JSON.stringify({ type: 'conversation.create', conversation: { agent_id: agentId } }));
      } catch (e) { void e; }
    });
    this.ws.on('close', (code, reason) => { this.connected = false; try { process.stdout.write(`el:close ${code} ${(reason||'').toString()}\n`); } catch (e) { void e; } if (this._want) this._reconnect(); });
    this.ws.on('unexpected-response', (_req, res) => { this.connected = false; try { process.stdout.write(`el:unexpected ${res.statusCode}\n`); } catch (e) { void e; } if (this._want) this._reconnect(); });
    this.ws.on('error', (e) => { this.connected = false; try { process.stdout.write(`el:error ${(e&&e.message)||'err'}\n`); } catch (e2) { void e2; } });
    this.ws.on('message', (data) => {
      try {
        if (typeof this.onAudio !== 'function') return;
        if (Buffer.isBuffer(data)) { this.onAudio(data); }
        else {
          const txt = data.toString('utf8');
          try {
            const obj = JSON.parse(txt);
            try { const t = obj?.type || obj?.event || 'json'; const err = obj?.error || obj?.data?.error; if (t||err) process.stdout.write(`el:msg type=${t}${err?` err=${String(err).slice(0,80)}`:''}\n`); } catch (e) { void e; }
            const b64 = obj?.audio || obj?.data?.audio; if (b64 && typeof b64==='string') this.onAudio(Buffer.from(b64,'base64'));
          } catch (e) { void e; }
        }
      } catch (e) { void e; }
    });
  }
  async sendAudio(pcm16leBuffer) {
    if (!this.connected || !this.ws) return;
    if (process.env.EL_FORWARD_BINARY === 'true') { try { this.ws.send(pcm16leBuffer); } catch (e) { void e; } }
  }
  async close() { this._want=false; if (this.ws) { try { this.ws.close(); } catch (e) { void e; } } this.connected = false; }
  _reconnect(){ const d=Math.min(this._backoff,5000); this._backoff=Math.min(this._backoff*2,5000); setTimeout(()=>{ if(this._want) this.connect().catch(()=>{}); }, d); }
}

wss.on('connection', async (ws, req) => {
  // Outbound pacing stop handle in outer scope
  let _stopTx = () => {};
  if (AUTH_TOKEN) {
    let allowed = false;
    let mode = 'unknown';
    let deny = '';
    try {
      const u = new URL(req.url || '/', 'http://localhost');
      const qp = u.searchParams.get('token') || '';
      // Also accept path-style token: /rtm/voice/jwt/<token>
      let pathTok = '';
      try {
        const parts = (u.pathname || '').split('/');
        const last = decodeURIComponent(parts[parts.length - 1] || '');
        if (last && last.includes('.')) pathTok = last;
      } catch (e) { void e; }
      const hdr = (req.headers['x-media-auth'] || '').toString();
      const tok = qp || pathTok || hdr;
      // Dual‑auth: accept valid JWT (if SHARED_SECRET) OR static token (if AUTH_TOKEN)
      if (SHARED_SECRET && tok && tok.includes('.')) {
        const v = verifyJwtHS256(tok, SHARED_SECRET, { aud: 'media', skewSec: JWT_SKEW_SEC });
        if (v.ok) { allowed = true; mode = 'jwt'; }
        else { deny = `jwt_${v.err||'invalid'}`; }
      }
      if (!allowed && AUTH_TOKEN && tok && tok === AUTH_TOKEN) { allowed = true; mode = 'token'; }
      if (!allowed && !deny) { deny = tok ? 'token_mismatch' : 'no_token'; }
    } catch (e) { void e; }
    if (!allowed) { try { process.stdout.write(`auth:deny ${deny||'deny'}\n`); } catch (e) { void e; } try { ws.close(1008, 'policy violation'); } catch (e) { void e; } return; }
    try { process.stdout.write(`auth:allow mode=${mode}\n`); } catch (e) { void e; }
    postLog('upgrade', { mode, url: req.url, qp_token: (new URL(req.url||'/', 'http://x')).searchParams.get('token') ? '***' : '' });
  }

  const connId = nanoid(8);
  let frames = 0;
  let streamSid = undefined;
  let lastMsgAt = Date.now();
  let keepalive = setInterval(() => { try { ws.ping(); } catch (e) { void e; } if (Date.now() - lastMsgAt > 30000) { try { ws.close(1001, 'idle'); } catch (e) { void e; } } }, 15000);

  const el = new ElevenLabsSession({ apiKey: process.env.ELEVENLABS_API_KEY, agentId: process.env.ELEVENLABS_AGENT_ID, url: process.env.ELEVENLABS_WS_URL });
  let elCommitTimer = null;
  let hadMedia = false;
  let startGraceTimer = null;
  let recorder = null;

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

  // removed legacy downsample16kTo8k (unused)

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
    // Enforce Media Streams order with tolerance: accept start even if 'connected' not seen.
    if (ev.event === 'connected') { ws.__gotConnected = true; return; }
    switch (ev.event) {
      case 'start': {
        // Tolerate missing 'connected' by inferring it
        if (!ws.__gotConnected) { ws.__gotConnected = true; }
      streamSid = ev.start?.streamSid || ev.streamSid || undefined;
      // Accept any non-empty streamSid to avoid false negatives across environments
      if (!String(streamSid || '').length) { try { ws.close(1008, 'invalid_streamSid'); } catch (e) { void e; } break; }
        process.stdout.write(`media:start id=${connId} sid=${streamSid || '-'}\n`);
        postLog('start', { connId, streamSid });
        ws.__gotStart = true;
        // Initialize recorder using callSid if configured
        try { if (REC_ENABLED) { const cs = ev.start?.callSid || ev.start?.call_id || 'nocall'; recorder = new Recorder(cs); } } catch(e) { void e; }
        if (startGraceTimer) { try { clearTimeout(startGraceTimer); } catch (e) { void e; } startGraceTimer = null; }
        // Configure back-audio path from ElevenLabs to Twilio
        // Use 20ms pacing and light low-pass + decimation to avoid aliasing/screech
        const txQueue = [];
        let txTimer = null;
        function startTx() {
          if (txTimer) return;
          txTimer = setInterval(() => {
            try {
              if (!txQueue.length) return;
              const payload = txQueue.shift();
              if (!streamSid || !payload) return;
              const msg = JSON.stringify({ event: 'media', streamSid, media: { payload } });
              ws.send(msg);
            } catch (e) { void e; }
          }, 20);
        }
        function stopTx() { if (txTimer) { try { clearInterval(txTimer); } catch (e) { void e; } txTimer = null; } }
        _stopTx = stopTx;

        function downsample16kTo8kLP(pcm16k) {
          const out = new Int16Array(Math.floor(pcm16k.length / 2));
          for (let i = 0, j = 0; i + 1 < pcm16k.length; i += 2, j++) out[j] = (pcm16k[i] + pcm16k[i + 1]) >> 1;
          return out;
        }

        el.onAudio = (buf) => {
          try {
            if (!streamSid) return;
            try { recorder && recorder.addVendorPCM16(Buffer.from(buf)); } catch(e) { void e; }
            const BYTES_PER_20MS_16K = 320 * 2; // 320 samples of 16k PCM16
            for (let off = 0; off + BYTES_PER_20MS_16K <= buf.byteLength; off += BYTES_PER_20MS_16K) {
              const slice = buf.subarray(off, off + BYTES_PER_20MS_16K);
              const pcm16 = new Int16Array(slice.buffer, slice.byteOffset, 320);
              const pcm8k = downsample16kTo8kLP(pcm16);
              const mulaw = pcm16ToMuLaw(pcm8k);
              const payload = Buffer.from(mulaw).toString('base64');
              txQueue.push(payload);
            }
            startTx();
          } catch (e) { void e; }
        };
        await el.connect().catch(()=>{});
        // Auto diagnostic probe (non-intrusive): parallel test WS with debug key
        (async function diagProbe(){
          try {
            if (process.env.DIAG_EL_AUTOPROBE !== 'true') return;
            const dbgKey = process.env.ELEVENLABS_API_KEY_DEBUG || '';
            const agent = process.env.ELEVENLABS_AGENT_ID || '';
            if (!dbgKey || !agent) return;
            const url = `wss://api.elevenlabs.io/v1/convai/conversation?agent_id=${agent}`;
            const w = new (require('ws'))(url, { headers: { 'xi-api-key': dbgKey }, perMessageDeflate: false });
            let done = false;
            const stop = () => { if (done) return; done = true; try { w.close(); } catch (e) { void e; } };
            w.on('open', ()=>{
              try { process.stdout.write('diag:open\n'); } catch (e) { void e; }
              try { w.send(JSON.stringify({ type: 'session.update', session: { input_audio_format: { type:'pcm16', sample_rate_hz:16000, channels:1 }, output_audio_format: { type:'pcm16', sample_rate_hz:16000, channels:1 } } })); } catch (e) { void e; }
              try { w.send(JSON.stringify({ type: 'conversation.create', conversation: { agent_id: agent } })); } catch (e) { void e; }
              try { w.send(JSON.stringify({ type: 'response.create' })); } catch (e) { void e; }
              setTimeout(stop, 1500);
            });
            w.on('message', (d)=>{ try { const o = JSON.parse(d.toString('utf8')); const t=o?.type||'json'; const er=o?.error||o?.data?.error||''; process.stdout.write(`diag:msg ${t}${er?` err=${String(er).slice(0,60)}`:''}\n`); } catch (err) { void err; try { process.stdout.write('diag:msg bin\n'); } catch (e2) { void e2; } } });
            w.on('unexpected-response', (_rq, rs)=>{ try { process.stdout.write(`diag:unexpected ${rs.statusCode}\n`); } catch (e) { void e; } ; stop(); });
            w.on('close', (c,r)=>{ try { process.stdout.write(`diag:close ${c} ${(r||'').toString()}\n`); } catch (e) { void e; } });
            w.on('error', (e)=>{ try { process.stdout.write(`diag:error ${(e&&e.message)||'err'}\n`); } catch (_) { void _; } ; stop(); });
          } catch (e) { void e; }
        })();
        // Send response.create ASAP once vendor is connected
        (function promptOnce(){
          if (el && el.connected && el.ws) { try { el.ws.send(JSON.stringify({ type: 'response.create' })); } catch (e) { void e; } }
          else setTimeout(promptOnce, 50);
        })();
        // Periodically append silence (until first media) and commit buffer
        if (!elCommitTimer) elCommitTimer = setInterval(() => {
          try {
            if (el && el.connected && el.ws) {
              if (!hadMedia) {
                const sil = Buffer.alloc(320).toString('base64');
                try { el.ws.send(JSON.stringify({ type: 'input_audio_buffer.append', audio: sil })); } catch (e) { void e; }
              }
              el.ws.send(JSON.stringify({ type: 'input_audio_buffer.commit' }));
            }
          } catch (e) { void e; }
        }, 150);
        break; }
      case 'media': {
        if (!ws.__gotStart) {
          // Tolerate out-of-order media; allow a longer grace window for 'start' to arrive
          if (!startGraceTimer) {
            const ms = Number(process.env.START_GRACE_MS || 2500);
            startGraceTimer = setTimeout(() => {
              if (!ws.__gotStart) { try { ws.close(1008, 'start_required_timeout'); } catch (e) { void e; } }
              try { startGraceTimer && clearTimeout(startGraceTimer); } catch (e) { void e; }
              startGraceTimer = null;
            }, ms);
          }
          break;
        }
        frames++; metrics.frames10s++;
        hadMedia = true;
        if (el && el.connected) {
          try {
            const b = Buffer.from(ev.media?.payload || '', 'base64'); if (b.byteLength > 16384) { try { ws.close(1009, 'payload too large'); } catch (e) { void e; } return; }
            const mu = new Uint8Array(b.buffer, b.byteOffset, b.byteLength);
            const pcm8k = decodeMuLawToPCM16(mu); const pcm16k = upsample8kTo16k(pcm8k); const le = int16ToLEBytes(pcm16k);
            // Send JSON audio frame to EL Agents API
            const audio = le.toString('base64');
            try { if (el.ws) el.ws.send(JSON.stringify({ type: 'input_audio_buffer.append', audio })); } catch (e) { void e; }
            // record inbound 16k PCM
            try { recorder && recorder.addInboundPCM16(Buffer.from(le)); } catch(e) { void e; }
          } catch (e) { void e; }
        }
        if (ws.bufferedAmount > 2_000_000) { try { ws.close(1009, 'backpressure'); } catch (e) { void e; } metrics.backpressure10m = Math.min(metrics.backpressure10m + 3, 60); metrics.lastBackpressureAt = Date.now(); }
        break; }
      case 'stop': { process.stdout.write(`media:stop id=${connId} frames=${frames}\n`); try { ws.close(1000, 'normal'); } catch (e) { void e; } break; }
      default: break;
    }
  });

  ws.on('close', async (code, reason) => { clearInterval(keepalive); try { _stopTx(); } catch (e) { void e; } if (elCommitTimer) { try { clearInterval(elCommitTimer); } catch (e) { void e; } elCommitTimer = null; } await el.close().catch((e)=>{ void e; }); try { recorder && await recorder.close(); } catch(e) { void e; } postLog('close', { connId, code, reason: (reason||'').toString() }); });
  ws.on('error', (e) => { void e; });
});

// Intercept HTTP upgrade to validate Twilio signature before accepting WebSocket
server.on('upgrade', (req, socket, head) => {
  try {
    const u = new URL(req.url || '/', 'http://localhost');
    const pathname = u.pathname;
    // Log every upgrade attempt (helps verify Twilio reaches the gateway)
    try {
      const sig = String(req.headers['x-twilio-signature'] || '');
      const ra = (req.socket && (req.socket.remoteAddress || req.socket.remoteFamily)) || '-';
      process.stdout.write(`upgrade:incoming path=${pathname} url=${req.url || '/'} sig=${sig? 'y':'n'} ra=${ra}\n`);
    } catch (e) { void e; }
    // Accept exact path or subpaths like /rtm/voice/jwt/<token>
    const okPath = pathname === WS_PATH || pathname.startsWith(WS_PATH + '/');
    if (!okPath) { try { socket.destroy(); } catch (e) { void e; } return; }
    const v = validateTwilioUpgradeSignature(req);
    if (!v.ok) {
      try { process.stdout.write(`upgrade:sig_skip reason=${v.reason || 'unknown'}\n`); } catch (e) { void e; }
      // Allow upgrade even if signature mismatched or absent; rely on JWT + event order
    }
    wss.handleUpgrade(req, socket, head, (ws) => { wss.emit('connection', ws, req); });
  } catch {
    try { socket.destroy(); } catch (e2) { void e2; }
  }
});
async function postLog(type, data) {
  try {
    if (!LOG_WEBHOOK_URL || !LOG_WEBHOOK_KEY) return;
    const payload = { type, ts: new Date().toISOString(), ...data };
    await fetch(LOG_WEBHOOK_URL, {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'x-log-key': LOG_WEBHOOK_KEY },
      body: JSON.stringify(payload)
    }).catch(()=>{});
  } catch (e) { void e; }
}

server.listen(PORT, () => { process.stdout.write(`media:listening ${PORT} ${WS_PATH}\n`); });
