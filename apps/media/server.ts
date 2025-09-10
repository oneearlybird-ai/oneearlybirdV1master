import http from 'node:http';
import { WebSocketServer, WebSocket } from 'ws';

const PORT = Number(process.env.PORT || 8080);
const PATH = process.env.WS_PATH || '/rtm/voice';

const srv = http.createServer((_req, res) => {
  res.writeHead(200, { 'content-type': 'application/json; charset=utf-8' });
  res.end(JSON.stringify({ ok: true, service: 'media', time: new Date().toISOString() }));
});

const wss = new WebSocketServer({ noServer: true });

function safeLog(msg: string, meta: Record<string, unknown> = {}) {
  try { console.log(JSON.stringify({ lvl: 'info', svc: 'media', msg, ...meta })); } catch { void 0; }
}

wss.on('connection', (ws: WebSocket, req) => {
  safeLog('ws:connected', { ip: req.socket.remoteAddress });
  ws.on('error', () => safeLog('ws:error'));
  ws.on('close', (code, reason) => safeLog('ws:closed', { code, reason: reason.toString() }));

  ws.on('message', (data, isBinary) => {
    if (ws.bufferedAmount > 1_000_000) {
      safeLog('ws:backpressure', { buffered: ws.bufferedAmount });
      return;
    }
    if (!isBinary) {
      try { const s = data.toString(); if (s === 'ping') ws.send('pong'); } catch { void 0; }
    }
  });

  const iv = setInterval(() => {
    if (ws.readyState === WebSocket.OPEN) { try { ws.ping(); } catch { void 0; } }
  }, 15_000);
  ws.on('close', () => clearInterval(iv));
});

srv.on('upgrade', (req, socket, head) => {
  if (req.url && req.url.startsWith(PATH)) {
    wss.handleUpgrade(req, socket, head, (ws) => wss.emit('connection', ws, req));
  } else {
    socket.destroy();
  }
});

srv.listen(PORT, () => safeLog('media:listen', { port: PORT, path: PATH }));

