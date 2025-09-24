import http from 'http';
import crypto from 'crypto';
import { WebSocketServer } from 'ws';

const PORT = Number(process.env.PORT || 8080);
const WS_PATH = process.env.WS_PATH || '/rtm/voice';
const AUTH_TOKEN = process.env.MEDIA_AUTH_TOKEN || '';
const SHARED_SECRET = process.env.MEDIA_SHARED_SECRET || '';
const TWILIO_AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN || '';
const JWT_SKEW_SEC = Number(process.env.JWT_SKEW_SEC || 30);

function nowIso() { return new Date().toISOString(); }



const server = http.createServer((req, res) => {
  const { url } = req;
  const pathname = (() => {
    try { return new URL(url || '/', 'http://localhost').pathname; } catch { return '/'; }
  })();

  if (pathname === '/') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ ok: true, service: 'media', wsPath: WS_PATH, time: nowIso() }));
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
function timingEqual(a, b) { if (a.length !== b.length) return false; return crypto.timingSafeEqual(a, b); }
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
  } catch { return { ok: false, err: 'exception' }; }
}

// Primary Media Streams endpoint
const wss = new WebSocketServer({ server, path: WS_PATH, perMessageDeflate: false });
wss.on('connection', (ws, req) => {
  // Log upgrade URL and token presence + validate upgrade signature + auth
  try {
    const u0 = new URL(req.url || '/', 'http://localhost');
    const t0 = u0.searchParams.get('token') || '';
    process.stdout.write(`upgrade url=${u0.pathname}${u0.search} qp_token_len=${t0.length}\n`);
    const sig = String(req.headers['x-twilio-signature'] || '');
    if (TWILIO_AUTH_TOKEN && !sig) { try { ws.close(1008, 'no_signature'); } catch (e) { void e; } return; }
    if (TWILIO_AUTH_TOKEN && sig) {
      const host = String(req.headers.host || '');
      const base = `wss://${host}${u0.pathname}`;
      const keys = [...u0.searchParams.keys()].sort();
      let payload = base; for (const k of keys) payload += k + (u0.searchParams.get(k) || '');
      const expected = crypto.createHmac('sha1', TWILIO_AUTH_TOKEN).update(payload, 'utf8').digest('base64');
      if (!timingEqual(Buffer.from(expected), Buffer.from(sig))) { try { ws.close(1008, 'sig_invalid'); } catch (e) { void e; } return; }
    }
    // Dual-auth: accept JWT (if SHARED_SECRET) or static token
    if (SHARED_SECRET && t0 && t0.includes('.')) {
      const v = verifyJwtHS256(t0, SHARED_SECRET, { aud: 'media', skewSec: JWT_SKEW_SEC });
      if (!v.ok) { try { ws.close(1008, 'jwt_invalid'); } catch (e) { void e; } return; }
    } else if (AUTH_TOKEN) {
      if (t0 !== AUTH_TOKEN) { try { ws.close(1008, 'policy'); } catch (e) { void e; } return; }
    }
  } catch (e) { void e; }

  const connId = Math.random().toString(36).slice(2,10);
  process.stdout.write(`conn:open id=${connId}\n`);

  let gotConnected = false;
  let gotStart = false;
  let streamSid = undefined;

  // Optional: send a tiny μ-law silence frame periodically after start
  let echoTimer = null;
  function startEcho() {
    if (echoTimer) return;
    echoTimer = setInterval(() => {
      if (!gotStart || !streamSid) return;
      const silence = Buffer.alloc(160, 0xFF); // 20ms @ 8k, μ-law silence-ish
      const payload = silence.toString('base64');
      const frame = JSON.stringify({ event: 'media', streamSid, media: { payload } });
      try { ws.send(frame); } catch (e) { void e; }
    }, 250);
  }

  ws.on('message', (msg) => {
    const txt = Buffer.isBuffer(msg) ? msg.toString('utf8') : String(msg);
    if (txt.toLowerCase().trim() === 'ping') { ws.send('pong'); return; }
    let ev = null; try { ev = JSON.parse(txt); } catch (e) { void e; }
    if (!ev) { if (!gotConnected) gotConnected = true; return; }
    if (typeof ev.event !== 'string') return;

    if (ev.event === 'connected') { gotConnected = true; return; }
    if (ev.event === 'start') {
      if (!gotConnected) { try { ws.close(1008, 'connected_required'); } catch (e) { void e; } return; }
      streamSid = ev.start?.streamSid || ev.streamSid || undefined;
      // Enforce Twilio streamSid shape: MS + 32 hex
      if (!/^MS[a-f0-9]{32}$/i.test(String(streamSid || ''))) { try { ws.close(1008, 'invalid_streamSid'); } catch (e) { void e; } return; }
      process.stdout.write(`media:start id=${connId} sid=${streamSid || '-'}\n`);
      gotStart = true;
      startEcho();
      return;
    }
    if (ev.event === 'media') {
      if (!gotStart) { try { ws.close(1008, 'start_required'); } catch (e) { void e; } return; }
      // We accept media frames; no vendor forwarding in this echo path
      return;
    }
    // benign
    if (ev.event === 'mark' || ev.event === 'stop') return;
  });

  ws.on('close', (code, reason) => {
    if (echoTimer) { try { clearInterval(echoTimer); } catch (e) { void e; }
      echoTimer = null;
    }
    try { process.stdout.write(`conn:close id=${connId} code=${code} reason=${(reason||'').toString()}\n`); } catch (e) { void e; }
  });
});

server.listen(PORT, () => {
  process.stdout.write(`media:listening ${PORT} ${WS_PATH}\n`);
});
