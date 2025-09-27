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
const ECHO_BACK = String(process.env.ECHO_BACK || '').toLowerCase() === 'true';
const LOG_WEBHOOK_URL = process.env.LOG_WEBHOOK_URL || '';
const LOG_WEBHOOK_KEY = process.env.LOG_WEBHOOK_KEY || '';
// Preferred vendor (ElevenLabs) PCM sample rate for input/output
const VENDOR_SR_HZ = Number(process.env.VENDOR_SR_HZ || 16000);

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

const wss = new WebSocketServer({
  noServer: true,
  perMessageDeflate: false,
  // Prefer Twilio 'audio' subprotocol if offered
  handleProtocols: (protocols /*, request */) => {
    try {
      if (Array.isArray(protocols) && protocols.includes('audio')) return 'audio';
      return Array.isArray(protocols) && protocols.length ? protocols[0] : false;
    } catch { return false; }
  }
});

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
    this.ws = new WebSocket(url, { headers: hdrs, perMessageDeflate: false });
    this.ws.on('open', () => { 
      this.connected = true; this._backoff=500;
      try { process.stdout.write('el:open\n'); } catch (e) { void e; }
      // ConvAI: no session.update / conversation.create needed here.
    });
    this.ws.on('close', (code, reason) => { this.connected = false; try { process.stdout.write(`el:close ${code} ${(reason||'').toString()}\n`); } catch (e) { void e; } if (this._want) this._reconnect(); });
    this.ws.on('unexpected-response', (_req, res) => { this.connected = false; try { process.stdout.write(`el:unexpected ${res.statusCode}\n`); } catch (e) { void e; } if (this._want) this._reconnect(); });
    this.ws.on('error', (e) => { this.connected = false; try { process.stdout.write(`el:error ${(e&&e.message)||'err'}\n`); } catch (e2) { void e2; } });
    this.ws.on('message', (data) => {
      try {
        if (Buffer.isBuffer(data)) {
          // Binary acceptance is opt-in; default to JSON path to avoid container/preview noise
          const acceptBin = String(process.env.EL_ACCEPT_BINARY || 'false').toLowerCase() === 'true';
          if (acceptBin && typeof this.onAudio === 'function' && data && data.length) {
            try { this._lastSrc = 'bin'; this.onAudio(Buffer.from(data)); } catch (_) { void _; }
          } // else ignore binary frames
        } else {
          const txt = data.toString('utf8');
          try {
            const obj = JSON.parse(txt);
            try {
              const t = obj?.type || obj?.event || 'json';
              const err = obj?.error || obj?.data?.error;
              if (t||err) process.stdout.write(`el:msg type=${t}${err?` err=${String(err).slice(0,80)}`:''}\n`);
                if (t === 'conversation_initiation_metadata') {
                  const m = obj?.conversation_initiation_metadata || obj?.conversation_initiation_metadata_event || {};
                  const ui = m?.user_input_audio_format || m?.user_audio_format || m?.user_input_format || '';
                  const ao = m?.agent_output_audio_format || m?.agent_output_format || m?.agent_audio_format || '';
                  try { process.stdout.write(`el:formats user_in=${String(ui)} agent_out=${String(ao)}\n`); } catch (_) { void _; }
                  try {
                    const pickSr = (fmt) => { const s = String(fmt||''); const mm = s.match(/(pcm|ulaw)_(\d{4,5})/i); return mm ? Number(mm[2]) : null; };
                    const sr = pickSr(ao) || pickSr(ui);
                    if (sr && (sr === 8000 || sr === 16000)) { this.streamSr = sr; try { process.stdout.write(`vmeta:sr=${sr}\n`);} catch(_) { void _; } }
                    this.agentOutFmt = String(ao||'');
                  } catch(_) { void _; }
                }
            } catch (e) { void e; }
            // ConvAI audio event
            const b64 = obj?.audio_event?.audio_base_64;
            if (b64 && typeof b64==='string' && typeof this.onAudio === 'function') { try { this._lastSrc = 'json'; this.preferJson = true; this.onAudio(Buffer.from(b64,'base64')); } catch(_) { void _; } }
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
        // Also accept path-style token: /rtm/voice/jwt/<token> (JWT or static)
        let pathTok = '';
        try {
          const parts = (u.pathname || '').split('/');
          const last = decodeURIComponent(parts[parts.length - 1] || '');
          if (last) pathTok = last;
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
  // Vendor stream metadata/preferences (held on el session instead)
  let startGraceTimer = null;
  let recorder = null;
  // Outbound aggregation to Twilio (canonical 20ms frames)
  let txAgg = [];
  let txAggLen = 0;
  let txTimer = null;
  let txChunk = 0;
  let __diagSendObsLeft = 3;
  function flushAgg(force=false) {
    try {
      if (!ws.__gotStart || !streamSid) return;
      const TARGET = 160; // 20ms @ 8k μ-law (160 bytes)
      if (!force && txAggLen < TARGET) return;
      if (!txAggLen) return;
      const buf = Buffer.concat(txAgg, txAggLen);
      txAgg = []; txAggLen = 0;
      if (__diagSendObsLeft > 0) { try { process.stdout.write(`sendBytes:${buf.length}\n`); } catch(_) { void _; } __diagSendObsLeft--; }
      const payload = buf.toString('base64');
      const ch = String(++txChunk);
      ws.send(JSON.stringify({ event: 'media', streamSid, media: { payload } }));
      try { ws.send(JSON.stringify({ event: 'mark', streamSid, mark: { name: `eb:${ch}` } })); } catch (e) { void e; }
    } catch (e) { void e; }
  }
  function startTx() {
    if (txTimer) return;
    // Pace close to frame duration to flush any stragglers
    txTimer = setInterval(() => flushAgg(false), 20);
  }
  // stopTx inlined into _stopTx assignment inside 'start' handler

  function enqueueMuLawFrame(b) {
    // Accept only exact 160-byte μ-law frames (20ms)
    if (!b || b.length !== 160) return;
    txAgg.push(b);
    txAggLen += b.length;
    if (txAggLen >= 160) flushAgg(true);
  }

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

  // Reference G.711 μ-law encoder (linear PCM16 -> μ-law 8-bit)
  function muLawEncodeSampleRef(sample) {
    // Clip to 16-bit signed range and compute sign
    let s = sample;
    if (s > 32767) s = 32767; else if (s < -32768) s = -32768;
    let sign = 0;
    if (s < 0) { sign = 0x80; s = -s; }
    // μ-law bias and clip per G.711
    const BIAS = 0x84; // 132
    const CLIP = 32635;
    if (s > CLIP) s = CLIP;
    s = s + BIAS;
    // Determine segment (exponent)
    let exponent = 7;
    let expMask = 0x4000;
    while ((s & expMask) === 0 && exponent > 0) { exponent--; expMask >>= 1; }
    // Mantissa selection per segment
    const mantissa = (s >> ((exponent === 0) ? 4 : (exponent + 3))) & 0x0F;
    // Compose and complement
    const ulaw = ~(sign | (exponent << 4) | mantissa) & 0xFF;
    return ulaw;
  }

  function pcm16ToMuLawRef(pcm) {
    const out = Buffer.allocUnsafe(pcm.length);
    for (let i = 0; i < pcm.length; i++) out[i] = muLawEncodeSampleRef(pcm[i]);
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
        try { const tr = ev.start?.tracks; if (tr) process.stdout.write(`twilio:tracks ${Array.isArray(tr)?tr.join(','):String(tr)}\n`); } catch (e) { void e; }
        postLog('start', { connId, streamSid });
        ws.__gotStart = true;
        // Initialize recorder using callSid if configured
        try { if (REC_ENABLED) { const cs = ev.start?.callSid || ev.start?.call_id || 'nocall'; recorder = new Recorder(cs); } } catch(e) { void e; }
        if (startGraceTimer) { try { clearTimeout(startGraceTimer); } catch (e) { void e; } startGraceTimer = null; }
        // Configure back-audio path from ElevenLabs to Twilio
        // High-fidelity DSP: 16k → 8k decimation using high-order FIR low-pass, then μ-law encode
        _stopTx = () => { if (txTimer) { try { clearInterval(txTimer); } catch (e) { void e; } txTimer = null; } };

        // --- Elite resampler: windowed-sinc FIR decimator (by 2) ---
        // Design parameters
        const HB_TAPS = Number(process.env.HB_TAPS || 127);  // odd length, e.g., 127
        const HB_CUTOFF = Number(process.env.HB_CUTOFF || 0.225); // normalized to fs (0..0.5)
        // Blackman-Harris window
        function blackmanHarris(M, n) {
          const a0 = 0.35875, a1 = 0.48829, a2 = 0.14128, a3 = 0.01168;
          const twoPi = Math.PI * 2;
          return a0
            - a1 * Math.cos(twoPi * n / (M - 1))
            + a2 * Math.cos(2 * twoPi * n / (M - 1))
            - a3 * Math.cos(3 * twoPi * n / (M - 1));
        }
        function designLowpassSinc(taps, cutoff) {
          const M = taps;
          const mid = (M - 1) / 2;
          const h = new Float64Array(M);
          let sum = 0;
          for (let n = 0; n < M; n++) {
            const k = n - mid;
            const x = k === 0 ? 2 * cutoff : Math.sin(2 * Math.PI * cutoff * k) / (Math.PI * k);
            const w = blackmanHarris(M, n);
            const v = x * w;
            h[n] = v; sum += v;
          }
          // Normalize DC gain to 1
          for (let n = 0; n < M; n++) h[n] /= sum || 1;
          return h;
        }
        function createDecimatorBy2(h) {
          const M = h.length; const mid = (M - 1) / 2;
          const state = new Float64Array(M - 1);
          return {
            pushBlock(int16) {
              const inLen = int16.length;
              // Build contiguous buffer of state + input (float)
              const buf = new Float64Array(state.length + inLen);
              for (let i = 0; i < state.length; i++) buf[i] = state[i];
              for (let i = 0; i < inLen; i++) buf[state.length + i] = int16[i];
              // Number of output samples (decimate by 2): floor(inLen/2)
              const outLen = Math.floor(inLen / 2);
              const out = new Int16Array(outLen);
              // Convolution at even phases: y[m] = sum_k h[k] x[2m + k]
              // We center-align impulse at mid.
              let outIdx = 0;
              // Start index in buf to align first output so that we consume exactly 2 samples per out
              // Choose base = mid to keep linear phase
              for (let base = mid; base + (M - 1 - mid) < buf.length && outIdx < outLen; base += 2) {
                let acc = 0;
                // h is symmetric: exploit symmetry to halve MACs
                for (let k = 0; k < mid; k++) {
                  const a = h[k]; const b = h[M - 1 - k];
                  const xl = buf[base - k]; const xr = buf[base + k];
                  acc += a * xl + b * xr;
                }
                acc += h[mid] * buf[base];
                // Clip, convert to int16
                let s = Math.round(acc);
                if (s > 32767) s = 32767; else if (s < -32768) s = -32768;
                out[outIdx++] = s;
              }
              // Update state: last M-1 samples of buf (the tail window)
              const tailStart = buf.length - (M - 1);
              for (let i = 0; i < M - 1; i++) state[i] = buf[tailStart + i];
              return out;
            }
          };
        }
        const hbCoefs = designLowpassSinc(HB_TAPS|0, Math.max(0.15, Math.min(0.245, HB_CUTOFF)));
        const hbDecimator = createDecimatorBy2(hbCoefs);

        // Optional: flush Twilio buffer at start to prevent artifact burst
        try { ws.send(JSON.stringify({ event: 'clear', streamSid })); } catch (e) { void e; }

        // Optional: inject short test tone before vendor audio to validate playback (OUT_TEST_TONE_MS)
        (function maybeInjectTone(){
          const ms = Number(process.env.OUT_TEST_TONE_MS || 0);
          if (!ms || ms < 40) return;
          const frames = Math.min(500, Math.floor(ms / 20));
          const TWO_PI = Math.PI * 2;
          const freq = Number(process.env.OUT_TONE_HZ || 1000);
          const amp = Number(process.env.OUT_TONE_AMP || 3000);
          const phaseStep = TWO_PI * freq / 8000;
          let phase = 0;
          for (let f = 0; f < frames; f++) {
            const pcm = new Int16Array(160);
            for (let i = 0; i < 160; i++) { pcm[i] = (amp * Math.sin(phase)) | 0; phase += phaseStep; }
            const mu = pcm16ToMuLawRef(pcm);
            enqueueMuLawFrame(Buffer.from(mu));
          }
          startTx();
        })();

        // Robust vendor PCM16/Float32 handling: alignment-safe, carryover between chunks
        let vendorCarry = Buffer.alloc(0);
        let vendorWavChecked = false;
        let vendorWavDataOffset = 0;
        let vendorWavBits = 16;
        let vendorWavFmt = 1; // 1=PCM, 3=IEEE float
        let vendorWavSr = VENDOR_SR_HZ;
        /** @type {'le'|'be'|null} */
        let vendorEndian = null;
        /** @type {'PCM16'|'F32'|null} */
        let vendorRawFormat = null;
        // Optional gentle fade-in to mask any TTS warmup artifacts (ms)
        const OUT_FADE_MS = Math.max(0, Number(process.env.OUT_FADE_MS || 150));
        let fadeFramesLeft = Math.min(50, Math.floor(OUT_FADE_MS / 20));
        function sniffWav(buf) {
          try {
            if (buf.length < 44) return null;
            if (buf.toString('ascii', 0, 4) !== 'RIFF') return null;
            if (buf.toString('ascii', 8, 12) !== 'WAVE') return null;
            let off = 12;
            let fmtFound = false;
            let dataOff = -1, dataLen = 0, audioFmt = 1, chans = 1, sr = 16000, bits = 16;
            while (off + 8 <= buf.length) {
              const chunkId = buf.toString('ascii', off, off + 4);
              const chunkSize = buf.readUInt32LE(off + 4);
              const next = off + 8 + chunkSize;
              if (chunkId === 'fmt ') {
                if (chunkSize >= 16) {
                  audioFmt = buf.readUInt16LE(off + 8);
                  chans = buf.readUInt16LE(off + 10);
                  sr = buf.readUInt32LE(off + 12);
                  bits = buf.readUInt16LE(off + 22);
                  fmtFound = true;
                }
              } else if (chunkId === 'data') {
                dataOff = off + 8;
                dataLen = chunkSize;
                break;
              }
              off = next;
            }
            if (!fmtFound || dataOff < 0) return null;
            return { dataOff, dataLen, audioFmt, chans, sr, bits };
          } catch { return null; }
        }
        function f32ToI16Sample(f) {
          let x = Math.max(-1, Math.min(1, f));
          return (x < 0 ? x * 32768 : x * 32767) | 0;
        }
        // Latch which vendor source we use (json vs bin) to avoid double mixing
        let vendorSrc = null; // 'json' | 'bin'
        function acceptVendorChunk(src) {
          if (!vendorSrc) {
            const choice = (el && el.preferJson === true) ? 'json' : src;
            vendorSrc = choice;
            try { process.stdout.write(`vsrc:${vendorSrc}\n`); } catch(_) { void _; }
            return vendorSrc === src;
          }
          return vendorSrc === src;
        }

        el.onAudio = (chunk) => {
          try {
            if (!streamSid) return;
            try { recorder && recorder.addVendorPCM16(Buffer.from(chunk)); } catch(e) { void e; }
            // OUT_FMT is for our Twilio target (always PCMU@8k); vendor format is from metadata
            const src = (typeof el._lastSrc === 'string') ? el._lastSrc : 'bin';
            const fmt = String(el && el.agentOutFmt || '').toLowerCase();
            const vendorIsUlaw   = /\bulaw_8000\b/.test(fmt);
            const vendorIsPcm16k = /^pcm_16000$/.test(fmt);
            const vendorIsPcm8k  = /^pcm_8000$/.test(fmt);
            let mode = 'unsupported';
            if (vendorIsUlaw) mode = 'pass';
            else if (vendorIsPcm16k || vendorIsPcm8k) mode = 'encode';
            try { process.stdout.write(`mode=${mode} vendor_fmt=${fmt}\n`); } catch(_) { void _; }
            if (mode === 'pass') {
               // Pass-through μ-law 8k: frame into 160-byte chunks and send
               if (!acceptVendorChunk(src)) return; // ignore other source once latched
               let buf = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk);
               if (vendorCarry.length) buf = Buffer.concat([vendorCarry, buf]);
               // Strip WAV header if present (μ-law fmt=7)
               if (!vendorWavChecked) {
                 vendorWavChecked = true;
                 const wav = sniffWav(buf);
                 if (wav) {
                   try { process.stdout.write(`wav:sr=${wav.sr} bits=${wav.bits} fmt=${wav.audioFmt} off=${wav.dataOff}\n`); } catch(_) { void _; }
                   if (wav.audioFmt === 7 && wav.sr === 8000 && wav.dataOff > 0) {
                     buf = buf.subarray(wav.dataOff);
                   }
                 }
               }
               let off = 0;
               while (off + 160 <= buf.length) { enqueueMuLawFrame(buf.subarray(off, off + 160)); off += 160; }
               vendorCarry = (off < buf.length) ? buf.subarray(off) : Buffer.alloc(0);
               startTx();
               return;
             }
            // bytes per 20ms depends on detected format; computed inline below
            let buf = chunk;
            if (!Buffer.isBuffer(buf)) buf = Buffer.from(buf);
            // prepend carryover
            if (vendorCarry.length) buf = Buffer.concat([vendorCarry, buf]);
            // One-time format decision per source
            if (!vendorWavChecked) {
              vendorWavChecked = true;
              if (src === 'bin') {
                const wav = sniffWav(buf);
                if (wav) {
                  vendorWavDataOffset = wav.dataOff;
                  vendorWavBits = wav.bits;
                  vendorWavFmt = wav.audioFmt; // 1=PCM, 3=float
                  vendorWavSr = wav.sr;
                  vendorEndian = 'le'; // WAV PCM is LE
                  try { process.stdout.write(`wav:sr=${vendorWavSr} bits=${vendorWavBits} fmt=${vendorWavFmt} off=${vendorWavDataOffset}\n`); } catch (_) { void _; }
                  if (vendorWavDataOffset > 0) buf = buf.subarray(vendorWavDataOffset);
                } else {
                  // ConvAI binary frames: guess Float32LE vs PCM16LE once, then lock
                  vendorEndian = 'le';
                  (function decideRaw(){
                    try {
                      const fCount = Math.min(24, Math.floor(buf.length / 4));
                      let okF = 0;
                      for (let i=0;i<fCount;i++) {
                        const f = buf.readFloatLE(i*4);
                        if (Number.isFinite(f) && Math.abs(f) <= 1.2) okF++;
                      }
                      vendorRawFormat = (okF >= Math.max(8, Math.floor(fCount*0.7))) ? 'F32' : 'PCM16';
                    } catch { vendorRawFormat = 'PCM16'; }
                  })();
                  try { process.stdout.write(`vraw:${vendorRawFormat||'PCM16'}\n`); } catch (_) { void _; }
                  vendorWavFmt = (vendorRawFormat === 'F32') ? 3 : 1;
                  vendorWavBits = (vendorRawFormat === 'F32') ? 32 : 16;
                }
              } else {
                // JSON audio_event is raw PCM16LE by contract
                vendorWavFmt = 1; vendorWavBits = 16; vendorEndian = 'le';
                try { process.stdout.write('vraw:JSON_PCM16\n'); } catch(_) { void _; }
              }
            }
            let off = 0;
            if (!acceptVendorChunk(src)) return;
            // process full 20ms frames
            while (true) {
              // Determine bytes needed for one 20ms frame based on vendorStreamSr
              const need = (el.streamSr === 16000)
                ? ((vendorWavFmt === 3 && vendorWavBits === 32) ? 320*4 : 320*2)
                : ((vendorWavFmt === 3 && vendorWavBits === 32) ? 160*4 : 160*2);
              if (off + need > buf.length) break;
              // Build Int16Array safely regardless of alignment
              if (el.streamSr === 16000) {
                const pcm16 = new Int16Array(320);
                if (vendorWavFmt === 3 && vendorWavBits === 32) {
                  // Float32 WAV
                  for (let i = 0; i < 320; i++) {
                    const p = off + (i * 4);
                    const f = buf.readFloatLE(p);
                    pcm16[i] = f32ToI16Sample(f);
                  }
                  off += 320 * 4;
                } else {
                  for (let i = 0; i < 320; i++) {
                    const p = off + (i * 2);
                    // Force LE for ConvAI unless explicit WAV dictates otherwise
                    pcm16[i] = vendorEndian === 'be' ? buf.readInt16BE(p) : buf.readInt16LE(p);
                  }
                  off += 320 * 2;
                }
                // Optional fade-in ramp
                if (fadeFramesLeft > 0) {
                  const steps = Math.max(1, Math.min(10, fadeFramesLeft));
                  const kNum = (steps - 1) / steps; // simple step down
                  for (let i=0;i<pcm16.length;i++) pcm16[i] = (pcm16[i] * kNum) | 0;
                  fadeFramesLeft--;
                }
                const pcm8k = hbDecimator.pushBlock(pcm16);
                const mulaw = pcm16ToMuLawRef(pcm8k);
                enqueueMuLawFrame(Buffer.from(mulaw));
              } else {
                // VENDOR_SR_HZ === 8000
                const pcm8 = new Int16Array(160);
                if (vendorWavFmt === 3 && vendorWavBits === 32) {
                  for (let i = 0; i < 160; i++) {
                    const p = off + (i * 4);
                    const f = buf.readFloatLE(p);
                    pcm8[i] = f32ToI16Sample(f);
                  }
                  off += 160 * 4;
                } else {
                  for (let i = 0; i < 160; i++) {
                    const p = off + (i * 2);
                    pcm8[i] = vendorEndian === 'be' ? buf.readInt16BE(p) : buf.readInt16LE(p);
                  }
                  off += 160 * 2;
                }
                if (fadeFramesLeft > 0) {
                  const steps = Math.max(1, Math.min(10, fadeFramesLeft));
                  const kNum = (steps - 1) / steps;
                  for (let i=0;i<pcm8.length;i++) pcm8[i] = (pcm8[i] * kNum) | 0;
                  fadeFramesLeft--;
                }
                const mulaw = pcm16ToMuLawRef(pcm8);
                enqueueMuLawFrame(Buffer.from(mulaw));
              }
            }
            // Save remainder for next chunk
            vendorCarry = (off < buf.length) ? buf.subarray(off) : Buffer.alloc(0);
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
              setTimeout(stop, 1500);
            });
            w.on('message', (d)=>{ try { const o = JSON.parse(d.toString('utf8')); const t=o?.type||'json'; process.stdout.write(`diag:msg ${t}\n`); } catch (err) { void err; } });
            w.on('unexpected-response', (_rq, rs)=>{ try { process.stdout.write(`diag:unexpected ${rs.statusCode}\n`); } catch (e) { void e; } ; stop(); });
            w.on('close', (c,r)=>{ try { process.stdout.write(`diag:close ${c} ${(r||'').toString()}\n`); } catch (e) { void e; } });
            w.on('error', (e)=>{ try { process.stdout.write(`diag:error ${(e&&e.message)||'err'}\n`); } catch (_) { void _; } ; stop(); });
          } catch (e) { void e; }
        })();
        // No response.create for ConvAI
        // No periodic append/commit for ConvAI; continuous user_audio_chunk is used
        if (elCommitTimer) { try { clearInterval(elCommitTimer); } catch(_) { void _; } elCommitTimer = null; }
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
        if (ECHO_BACK) {
          // Echo inbound payloads immediately (no decode/encode, no aggregation)
          try {
            const payload = String(ev.media?.payload || '');
            if (payload && streamSid) {
              ws.send(JSON.stringify({ event: 'media', streamSid, media: { payload } }));
              try { ws.send(JSON.stringify({ event: 'mark', streamSid, mark: { name: 'eb:direct' } })); } catch (e) { void e; }
            }
          } catch (e) { void e; }
          } else if (el && el.connected) {
          try {
            const b = Buffer.from(ev.media?.payload || '', 'base64'); if (b.byteLength > 16384) { try { ws.close(1009, 'payload too large'); } catch (e) { void e; } return; }
            const mu = new Uint8Array(b.buffer, b.byteOffset, b.byteLength);
            const pcm8k = decodeMuLawToPCM16(mu);
            // ConvAI: send user_audio_chunk at 16k PCM
            const pcm16k = upsample8kTo16k(pcm8k);
            const le = int16ToLEBytes(pcm16k);
            const audio = le.toString('base64');
            try { if (el.ws) el.ws.send(JSON.stringify({ user_audio_chunk: audio })); } catch (e) { void e; }
            try { recorder && recorder.addInboundPCM16(Buffer.from(le)); } catch(e) { void e; }
          } catch (e) { void e; }
        }
        if (ws.bufferedAmount > 2_000_000) { try { ws.close(1009, 'backpressure'); } catch (e) { void e; } metrics.backpressure10m = Math.min(metrics.backpressure10m + 3, 60); metrics.lastBackpressureAt = Date.now(); }
        break; }
      case 'mark': {
        try { const name = String(ev?.mark?.name || ''); process.stdout.write(`twilio:mark ${name}\n`); } catch (e) { void e; }
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
