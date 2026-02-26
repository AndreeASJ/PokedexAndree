/**
 * Local dev server: serves static files.
 * Run: node server.js  or  npm start
 */
const http = require('http');
const fs = require('fs');
const path = require('path');
const { URL } = require('url');

const PORT = Number(process.env.PORT) || 3000;

function serveFile(req, res, filePath) {
  const ext = path.extname(filePath);
  const types = {
    '.html': 'text/html',
    '.js': 'application/javascript',
    '.css': 'text/css',
    '.json': 'application/json',
    '.ico': 'image/x-icon',
    '.png': 'image/png',
    '.svg': 'image/svg+xml',
  };
  const contentType = types[ext] || 'application/octet-stream';
  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(404);
      res.end();
      return;
    }
    res.writeHead(200, { 'Content-Type': contentType });
    res.end(data);
  });
}

const server = http.createServer((req, res) => {
  const parsed = new URL(req.url || '/', 'http://localhost');
  const pathname = parsed.pathname;
  const filePath = pathname === '/' ? './index.html' : path.join('.', pathname);
  fs.stat(filePath, (err, stat) => {
    if (err || !stat.isFile()) {
      res.writeHead(404);
      res.end();
      return;
    }
    serveFile(req, res, filePath);
  });
});

server.listen(PORT, () => {
  console.log(`Pokedex: http://localhost:${PORT}`);
});
