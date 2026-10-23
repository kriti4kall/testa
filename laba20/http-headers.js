import http from 'http';

const PORT = process.env.PORT || 3000;

function formatTimestamp(date = new Date()) {
  const pad = (num) => String(num).padStart(2, '0');
  const dateStr = `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
  const timeStr = `${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
  return `${dateStr} ${timeStr}`;
}

function toHeaderValue(str) {
  // В HTTP заголовках Node.js требует символы latin1 (код <= 255).
  // Кодируем UTF-8 строку в latin1, чтобы на клиенте корректно отобразилась кириллица
  return Buffer.from(String(str), 'utf-8').toString('latin1');
}

const server = http.createServer((req, res) => {
  const urlPath = req.url.split('?')[0];

  res.on('finish', () => {
    console.log(`[${formatTimestamp()}] ${req.method} ${req.url} ${res.statusCode}`);
  });

  // Эндпоинт 1: GET /headers — возврат всех заголовков запроса
  if (req.method === 'GET' && urlPath === '/headers') {
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.setHeader('X-Powered-By', 'Node.js');
    res.setHeader('X-Group', toHeaderValue('ББМО-01-23'));
    res.setHeader('Cache-Control', 'no-cache');

    const payload = {
      headers: req.headers,
      method: req.method,
      url: req.url,
      httpVersion: req.httpVersion
    };

    res.statusCode = 200;
    res.end(JSON.stringify(payload, null, 2) + '\n');
    return;
  }

  // Эндпоинт 2: GET /headers/set — установка и удаление кастомных заголовков
  if ((req.method === 'GET' || req.method === 'HEAD') && urlPath === '/headers/set') {
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.setHeader('X-Powered-By', 'Node.js');
    res.setHeader('X-Group', toHeaderValue('ББМО-01-23'));
    res.setHeader('Cache-Control', 'no-cache');

    // Демонстрация setHeader и removeHeader до отправки
    res.setHeader('X-Temporary-Header', 'TempToBeRemoved');
    if (res.hasHeader('X-Temporary-Header')) {
      res.removeHeader('X-Temporary-Header');
    }

    res.statusCode = 200;
    res.end('<h1>Кастомные заголовки успешно установлены</h1>\n');
    return;
  }

  // Эндпоинт 3: GET /headers/check — проверка наличия заголовков через hasHeader и getHeader
  if (req.method === 'GET' && urlPath === '/headers/check') {
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.setHeader('X-Group', toHeaderValue('ББМО-01-23'));

    const checkResult = {
      hasContentType: res.hasHeader('Content-Type'),
      hasXGroup: res.hasHeader('X-Group'),
      hasUnknown: res.hasHeader('X-Unknown')
    };

    res.statusCode = 200;
    res.end(JSON.stringify(checkResult, null, 2) + '\n');
    return;
  }

  res.statusCode = 404;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.end(JSON.stringify({ error: 'Not Found', url: req.url }) + '\n');
});

server.listen(PORT, () => {
  console.log(`Сервер заголовков запущен на порту ${PORT}`);
});
