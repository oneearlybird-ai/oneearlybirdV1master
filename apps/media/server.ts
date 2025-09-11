import http from 'http';
import { WebSocketServer } from 'ws';
import url from 'url';

const PORT = Number(process.env.PORT || 8080);
const WS_PATH = process.env.WS_PATH || '/rtm/voice';

const server = http.createServer((req, res) => {
  const { pathname } = url.parse(req.url || '/');
  if (pathname === '/') {
    res.writeHead(200, {'Content-Type':'application/json'});
    res.end(JSON.stringify({ ok:true, service:'media', wsPath: WS_PATH, time: new Date().toISOString() }));
    return;
  }
  // 404 for anything else
  res.writeHead(404, {'Content-Type':'application/json'});
  res.end(JSON.stringify({ ok:false, error:'not_found' }));
});

const wss = new WebSocketServer({ server, path: WS_PATH });
wss.on('connection', (ws) => {
  ws.on('message', (msg) => {
    const m = msg.toString();
    if (m.toLowerCase().trim() === 'ping') ws.send('pong');
  });
  // No PHI logs: only minimal lifecycle markers
});

server.listen(PORT, () => {
  // No PHI; single line to indicate bind success
  process.stdout.write(`media:listening ${PORT} ${WS_PATH}\n`);
});
