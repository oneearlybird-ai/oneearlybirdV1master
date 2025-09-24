import http from 'http';
import { WebSocketServer } from 'ws';

const PORT = Number(process.env.PORT || 8080);
const WS_PATH = process.env.WS_PATH || '/rtm/voice';
const AUTH_TOKEN = process.env.MEDIA_AUTH_TOKEN || '';

function nowIso() { return new Date().toISOString(); }

function xmlSafe(s) { return String(s).replace(/&/g,'&amp;').replace(/"/g,'&quot;'); }

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

// Primary Media Streams endpoint
const wss = new WebSocketServer({ server, path: WS_PATH, perMessageDeflate: false });
wss.on('connection', (ws, req) => {
  // Log upgrade URL and token presence
  try {
    const u0 = new URL(req.url || '/', 'http://localhost');
    const t0 = u0.searchParams.get('token') || '';
    process.stdout.write(`upgrade url=${u0.pathname}${u0.search} qp_token_len=${t0.length}\n`);
    if (AUTH_TOKEN && t0 !== AUTH_TOKEN) {
      try { ws.close(1008, 'policy'); } catch {}
      return;
    }
  } catch {}

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
      try { ws.send(frame); } catch {}
    }, 250);
  }

  ws.on('message', (msg) => {
    const txt = Buffer.isBuffer(msg) ? msg.toString('utf8') : String(msg);
    if (txt.toLowerCase().trim() === 'ping') { ws.send('pong'); return; }
    let ev = null; try { ev = JSON.parse(txt); } catch {}
    if (!ev) { if (!gotConnected) gotConnected = true; return; }
    if (typeof ev.event !== 'string') return;

    if (ev.event === 'connected') { gotConnected = true; return; }
    if (ev.event === 'start') {
      if (!gotConnected) { try { ws.close(1008, 'connected_required'); } catch {} return; }
      streamSid = ev.start?.streamSid || ev.streamSid || undefined;
      process.stdout.write(`media:start id=${connId} sid=${streamSid || '-'}\n`);
      gotStart = true;
      startEcho();
      return;
    }
    if (ev.event === 'media') {
      if (!gotStart) { try { ws.close(1008, 'start_required'); } catch {} return; }
      // We accept media frames; no vendor forwarding in this echo path
      return;
    }
    // benign
    if (ev.event === 'mark' || ev.event === 'stop') return;
  });

  ws.on('close', (code, reason) => {
    if (echoTimer) { try { clearInterval(echoTimer); } catch {}
      echoTimer = null;
    }
    try { process.stdout.write(`conn:close id=${connId} code=${code} reason=${(reason||'').toString()}\n`); } catch {}
  });
});

server.listen(PORT, () => {
  process.stdout.write(`media:listening ${PORT} ${WS_PATH}\n`);
});
