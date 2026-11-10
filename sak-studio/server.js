/* 本地预览服务器
   用法：双击 start.cmd，或命令行 node server.js
   会自动找空端口并在浏览器打开 */
const http = require('http');
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

const ROOT = __dirname;
const START_PORT = Number(process.env.PORT || 5173);
const MAX_TRIES = 8;

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.webp': 'image/webp',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.mp4': 'video/mp4',
  '.woff2': 'font/woff2'
};

function handler(req, res) {
  let rel = decodeURIComponent(req.url.split('?')[0]);
  if (rel === '/') rel = '/index.html';

  const file = path.join(ROOT, path.normalize(rel).replace(/^([/\\])+/, ''));
  if (!file.startsWith(ROOT)) { res.writeHead(403); return res.end('forbidden'); }

  fs.readFile(file, (err, buf) => {
    if (err) {
      res.writeHead(404, { 'content-type': 'text/plain; charset=utf-8' });
      return res.end('404 ' + rel);
    }
    res.writeHead(200, {
      'content-type': MIME[path.extname(file).toLowerCase()] || 'application/octet-stream',
      'cache-control': 'no-cache'
    });
    res.end(buf);
  });
}

let port = START_PORT;
let tries = 0;

function listen() {
  const server = http.createServer(handler);

  server.once('error', (err) => {
    if (err.code === 'EADDRINUSE' && tries < MAX_TRIES) {
      tries += 1;
      port += 1;
      console.log('port ' + (port - 1) + ' busy, trying ' + port + ' ...');
      listen();
    } else {
      console.error('failed:', err.message);
      process.exit(1);
    }
  });

  server.listen(port, () => {
    const url = 'http://localhost:' + port + '/';
    console.log('');
    console.log('  SAK 工作室 · ' + url);
    console.log('  Ctrl+C 停止');
    console.log('');
    if (process.env.NO_OPEN !== '1') {
      exec('start "" "' + url + '"');
    }
  });
}

listen();
