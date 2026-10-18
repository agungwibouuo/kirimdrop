const http = require('http');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { WebSocketServer } = require('ws');

const PORT = process.env.PORT || 3777;
const HOST = process.env.HOST || '127.0.0.1';
const PUBLIC_DIR = path.join(__dirname, 'public');

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.ico': 'image/x-icon',
  '.json': 'application/json; charset=utf-8',
};

const server = http.createServer((req, res) => {
  let pathname;
  try {
    pathname = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
  } catch {
    res.writeHead(400);
    res.end('Bad request');
    return;
  }
  if (pathname === '/') pathname = '/index.html';
  const filePath = path.join(PUBLIC_DIR, path.normalize(pathname).replace(/^(\.\.[/\\])+/, ''));
  fs.readFile(filePath, (err, data) => {
    if (err || !filePath.startsWith(PUBLIC_DIR)) {
      res.writeHead(404);
      res.end('Not found');
      return;
    }
    const ext = path.extname(filePath);
    res.writeHead(200, {
      'Content-Type': MIME[ext] || 'application/octet-stream',
      'Cache-Control': 'no-cache',
    });
    res.end(data);
  });
});

// ---- Signaling: rooms + peer discovery + WebRTC signal relay ----
const rooms = new Map(); // room -> Map(peerId -> { ws, name, id })

function send(ws, obj) {
  if (ws && ws.readyState === 1) ws.send(JSON.stringify(obj));
}

function broadcast(room, exceptId, payload) {
  const r = rooms.get(room);
  if (!r) return;
  for (const [pid, peer] of r) {
    if (pid !== exceptId) send(peer.ws, payload);
  }
}

function roster(room) {
  const r = rooms.get(room);
  if (!r) return [];
  return [...r.entries()].map(([pid, peer]) => ({ id: pid, name: peer.name }));
}

const wss = new WebSocketServer({ server, path: '/ws' });

wss.on('connection', (ws) => {
  let joined = false;

  ws.on('message', (raw) => {
    let msg;
    try { msg = JSON.parse(raw.toString()); } catch { return; }

    if (msg.type === 'join') {
      const room = String(msg.room || '').replace(/[^a-z0-9-]/gi, '-').slice(0, 64) || 'default';
      const name = String(msg.name || 'Anon').slice(0, 32) || 'Anon';
      const id = crypto.randomUUID();
      joined = true;
      ws._room = room;
      ws._id = id;
      ws._name = name;
      if (!rooms.has(room)) rooms.set(room, new Map());
      rooms.get(room).set(id, { ws, name, id });
      // Send self + current roster
      send(ws, { type: 'welcome', id, room, peers: roster(room).filter((p) => p.id !== id) });
      // Notify others
      broadcast(room, id, { type: 'peer-join', id, name });
    } else if (msg.type === 'signal') {
      if (!joined || !rooms.has(ws._room)) return;
      const target = rooms.get(ws._room).get(msg.to);
      if (target) send(target.ws, { type: 'signal', from: ws._id, room: ws._room, data: msg.data });
    }
  });

  ws.on('close', () => {
    if (!joined) return;
    const r = rooms.get(ws._room);
    if (r) {
      r.delete(ws._id);
      if (r.size === 0) rooms.delete(ws._room);
      broadcast(ws._room, ws._id, { type: 'peer-leave', id: ws._id });
    }
  });

  ws.on('error', () => { /* let close handle it */ });
});

server.listen(PORT, HOST, () => {
  console.log(`[kirimdrop] listening on ${HOST}:${PORT} (public: ${PUBLIC_DIR})`);
});

// Graceful shutdown
for (const sig of ['SIGTERM', 'SIGINT']) {
  process.on(sig, () => {
    console.log(`[kirimdrop] ${sig}, shutting down`);
    wss.close(() => process.exit(0));
    server.close(() => process.exit(0));
    setTimeout(() => process.exit(0), 3000).unref();
  });
}
