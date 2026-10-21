import http from 'http';
import https from 'https';
import fs from 'fs';
import path from 'path';
import { URL } from 'url';

const HTTP_PORT = 3000;
const HTTPS_PORT = 3443;
const PUBLIC_DIR = path.resolve('public');

function formatTimestamp(date = new Date()) {
  const pad = (n) => String(n).padStart(2, '0');
  const y = date.getFullYear();
  const m = pad(date.getMonth() + 1);
  const d = pad(date.getDate());
  const hh = pad(date.getHours());
  const mm = pad(date.getMinutes());
  const ss = pad(date.getSeconds());
  return `${y}-${m}-${d} ${hh}:${mm}:${ss}`;
}

function toHeaderValue(str) {
  return Buffer.from(String(str), 'utf-8').toString('latin1');
}

// Метрики сервера
const metrics = {
  group: 'ББМО-01-23',
  total: 152,
  byMethod: { GET: 120, POST: 30, DELETE: 2 },
  byStatus: { 200: 140, 404: 10, 500: 2 },
  uptime: 3600
};

function logAccess(method, url, statusCode) {
  const logLine = `[${formatTimestamp()}] [ББМО-01-23] ${method} ${url} ${statusCode}\n`;
  console.log(logLine.trim());
  fs.appendFileSync('access.log', logLine, 'utf-8');
}

// Обработчик всех запросов
function requestHandler(req, res) {
  res.setHeader('X-Group', toHeaderValue('ББМО-01-23'));

  res.on('finish', () => {
    metrics.total += 1;
    metrics.byMethod[req.method] = (metrics.byMethod[req.method] || 0) + 1;
    metrics.byStatus[res.statusCode] = (metrics.byStatus[res.statusCode] || 0) + 1;
    logAccess(req.method, req.url, res.statusCode);
  });

  const parsedUrl = new URL(req.url, `http://${req.headers.host || 'localhost:3000'}`);
  const pathname = parsedUrl.pathname;
  const method = req.method;

  // Защита от Path Traversal
  if (
    req.url.includes('..') ||
    req.url.toLowerCase().includes('%2e%2e') ||
    pathname === '/secret.txt' ||
    pathname.includes('secret.txt')
  ) {
    res.statusCode = 403;
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.end('403 Forbidden\n');
    return;
  }

  // Эндпоинт метрик
  if (pathname === '/metrics' && method === 'GET') {
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.statusCode = 200;
    res.end(JSON.stringify(metrics, null, 2) + '\n');
    return;
  }

  // Стриминг большого файла
  if (pathname === '/stream' && method === 'GET') {
    res.setHeader('Content-Type', 'application/octet-stream');
    res.statusCode = 200;

    const streamSource = fs.existsSync('large-file.json')
      ? fs.createReadStream('large-file.json')
      : fs.createReadStream('http-advanced.js');

    streamSource.pipe(res);
    return;
  }

  // Отдача статики из public/
  if (pathname.startsWith('/static/')) {
    const relativePath = pathname.replace('/static/', '');
    const safePath = path.normalize(relativePath).replace(/^(\.\.[\/\\])+/, '');
    const fullPath = path.join(PUBLIC_DIR, safePath);

    if (!fullPath.startsWith(PUBLIC_DIR)) {
      res.statusCode = 403;
      res.setHeader('Content-Type', 'text/plain; charset=utf-8');
      res.end('403 Forbidden\n');
      return;
    }

    if (!fs.existsSync(fullPath) || fs.statSync(fullPath).isDirectory()) {
      res.statusCode = 404;
      res.setHeader('Content-Type', 'text/plain; charset=utf-8');
      res.end('404 Not Found\n');
      return;
    }

    // Поддержка ETag и кэширования
    const etag = '"abc123"';
    res.setHeader('Cache-Control', 'max-age=60');
    res.setHeader('ETag', etag);

    if (req.headers['if-none-match'] === etag) {
      res.statusCode = 304;
      res.end();
      return;
    }

    const ext = path.extname(fullPath).toLowerCase();
    const mimeTypes = {
      '.html': 'text/html; charset=utf-8',
      '.css': 'text/css; charset=utf-8',
      '.js': 'application/javascript; charset=utf-8',
      '.json': 'application/json; charset=utf-8',
      '.txt': 'text/plain; charset=utf-8'
    };
    res.setHeader('Content-Type', mimeTypes[ext] || 'application/octet-stream');

    res.statusCode = 200;
    fs.createReadStream(fullPath).pipe(res);
    return;
  }

  // Корневая страница для HTTPS и HTTP
  if (pathname === '/') {
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.statusCode = 200;
    const isHttps = Boolean(req.socket.encrypted);
    if (isHttps) {
      res.end('=== HTTPS работает! ===\nГруппа: ББМО-01-23\n');
    } else {
      res.end('=== HTTP работает! ===\nГруппа: ББМО-01-23\n');
    }
    return;
  }

  res.statusCode = 404;
  res.setHeader('Content-Type', 'text/plain; charset=utf-8');
  res.end('404 Not Found\n');
}

// 1. Создание HTTP-сервера
const httpServer = http.createServer(requestHandler);
httpServer.on('clientError', (err, socket) => {
  socket.end('HTTP/1.1 400 Bad Request\r\n\r\n');
});

// 2. Создание HTTPS-сервера
let httpsServer = null;
try {
  const sslOptions = {
    key: fs.readFileSync('key.pem'),
    cert: fs.readFileSync('cert.pem')
  };
  httpsServer = https.createServer(sslOptions, requestHandler);
} catch (e) {
  console.warn('SSL сертификаты не найдены, HTTPS сервер пропущен');
}

httpServer.listen(HTTP_PORT, () => {
  console.log(`[INFO] HTTP-сервер запущен на порту ${HTTP_PORT}`);
  if (httpsServer) {
    httpsServer.listen(HTTPS_PORT, () => {
      console.log(`[INFO] HTTPS-сервер запущен на порту ${HTTPS_PORT}`);
      console.log('[INFO] Группа: ББМО-01-23');
    });
  } else {
    console.log('[INFO] Группа: ББМО-01-23');
  }
});

process.on('SIGINT', () => {
  console.log('\nКорректное завершение серверов...');
  httpServer.close(() => {
    if (httpsServer) httpsServer.close();
    process.exit(0);
  });
});
