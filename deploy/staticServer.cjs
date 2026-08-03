// Render static server for the AdzConnect frontend.
// Serves the built SPA from ../dist, falls back to index.html for client routes,
// and proxies /api (HTTP) and /ws (WebSocket) to the backend service. Zero deps.
const http = require('http');
const fs = require('fs');
const path = require('path');
const net = require('net');

const PORT = process.env.PORT || 3000;
const DIST_DIR = path.join(__dirname, '..', 'dist');
const BACKEND_INTERNAL_URL = process.env.BACKEND_INTERNAL_URL || 'localhost:5000';

const [BACKEND_HOST, BACKEND_PORT_STR] = BACKEND_INTERNAL_URL.split(':');
const BACKEND_PORT = Number(BACKEND_PORT_STR) || 5000;

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json',
  '.map': 'application/json',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.webp': 'image/webp',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.mp4': 'video/mp4',
  '.webm': 'video/webm',
  '.txt': 'text/plain; charset=utf-8',
};

const CACHEABLE = new Set([
  '.js', '.css', '.svg', '.png', '.jpg', '.jpeg', '.gif', '.webp',
  '.ico', '.woff', '.woff2', '.ttf', '.mp4', '.webm',
]);

function getMime(ext) {
  return MIME[ext] || 'application/octet-stream';
}

function serveStatic(req, res) {
  let urlPath = decodeURIComponent(req.url.split('?')[0]);
  if (urlPath === '/') urlPath = '/index.html';

  const filePath = path.normalize(path.join(DIST_DIR, urlPath));
  if (!filePath.startsWith(DIST_DIR)) {
    res.writeHead(403, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('Forbidden');
    return;
  }

  fs.stat(filePath, (err, stats) => {
    if (!err && stats.isFile()) {
      const ext = path.extname(filePath).toLowerCase();
      res.writeHead(200, {
        'Content-Type': getMime(ext),
        'Cache-Control': CACHEABLE.has(ext) ? 'public, max-age=31536000, immutable' : 'no-cache',
        'X-Content-Type-Options': 'nosniff',
        'X-Frame-Options': 'SAMEORIGIN',
      });
      fs.createReadStream(filePath).pipe(res);
      return;
    }

    fs.stat(path.join(DIST_DIR, 'index.html'), (err2, stat2) => {
      if (err2 || !stat2.isFile()) {
        res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
        res.end('Not found');
        return;
      }
      res.writeHead(200, {
        'Content-Type': 'text/html; charset=utf-8',
        'Cache-Control': 'no-cache',
        'X-Frame-Options': 'SAMEORIGIN',
      });
      fs.createReadStream(path.join(DIST_DIR, 'index.html')).pipe(res);
    });
  });
}

function proxyHttp(req, res) {
  const proxyReq = http.request(
    {
      host: BACKEND_HOST,
      port: BACKEND_PORT,
      path: req.url,
      method: req.method,
      headers: req.headers,
    },
    (proxyRes) => {
      res.writeHead(proxyRes.statusCode, proxyRes.headers);
      proxyRes.pipe(res);
    }
  );
  proxyReq.on('error', (err) => {
    console.error('[proxy] backend request failed:', err.message);
    if (!res.headersSent) {
      res.writeHead(502, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ message: 'Backend unavailable' }));
    } else {
      res.end();
    }
  });
  req.on('error', () => proxyReq.destroy());
  req.pipe(proxyReq);
}

function proxyWebSocket(req, socket, head) {
  const backendSocket = net.connect(BACKEND_PORT, BACKEND_HOST, () => {
    const headers = Object.entries(req.headers)
      .filter(([key]) => key.toLowerCase() !== 'connection')
      .map(([key, value]) => `${key}: ${value}`)
      .join('\r\n');

    backendSocket.write(
      `${req.method} ${req.url} HTTP/${req.httpVersion}\r\n` +
        `${headers}\r\n` +
        'Connection: Upgrade\r\n' +
        'Upgrade: websocket\r\n\r\n'
    );
    if (head && head.length) backendSocket.write(head);
  });

  backendSocket.on('error', (err) => {
    console.error('[ws-proxy] backend connection failed:', err.message);
    socket.destroy();
  });

  socket.on('error', () => backendSocket.destroy());

  backendSocket.on('data', (chunk) => {
    if (socket.writable) socket.write(chunk);
  });
  backendSocket.on('end', () => socket.end());
  backendSocket.on('close', () => socket.destroy());

  socket.on('data', (chunk) => backendSocket.write(chunk));
  socket.on('close', () => backendSocket.destroy());
}

const server = http.createServer((req, res) => {
  if (req.url.startsWith('/api')) {
    proxyHttp(req, res);
  } else {
    serveStatic(req, res);
  }
});

server.on('upgrade', (req, socket, head) => {
  if (req.url.startsWith('/ws')) {
    proxyWebSocket(req, socket, head);
  } else {
    socket.write('HTTP/1.1 404 Not Found\r\nConnection: close\r\n\r\n');
    socket.destroy();
  }
});

server.listen(PORT, () => {
  console.log(`AdzConnect frontend server listening on port ${PORT}`);
  console.log(`Proxying /api and /ws to ${BACKEND_INTERNAL_URL}`);
});
