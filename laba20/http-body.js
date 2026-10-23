import http from 'http';

const PORT = process.env.PORT || 3000;
const MAX_BODY_SIZE = 1 * 1024 * 1024; // 1 МБ

function formatTimestamp(date = new Date()) {
  const pad = (num) => String(num).padStart(2, '0');
  const dateStr = `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
  const timeStr = `${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
  return `${dateStr} ${timeStr}`;
}

function readRequestBody(req, maxSizeBytes = MAX_BODY_SIZE) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    let receivedBytes = 0;
    let limitExceeded = false;

    req.on('data', (chunk) => {
      receivedBytes += chunk.length;
      if (receivedBytes > maxSizeBytes) {
        limitExceeded = true;
        // Сбрасываем поток данных, чтобы не расходовать память
        req.pause();
        const err = new Error('413 Payload Too Large');
        err.statusCode = 413;
        reject(err);
        return;
      }
      chunks.push(chunk);
    });

    req.on('end', () => {
      if (limitExceeded) return;
      const buffer = Buffer.concat(chunks);
      resolve({ buffer, size: receivedBytes });
    });

    req.on('error', (err) => {
      reject(err);
    });
  });
}

const server = http.createServer(async (req, res) => {
  const urlPath = req.url.split('?')[0];

  let bodyData;
  try {
    bodyData = await readRequestBody(req);
  } catch (err) {
    if (err.statusCode === 413) {
      console.log(`[${formatTimestamp()}] ${req.method} ${req.url} 413 - Превышен лимит тела (>1 МБ)`);
      res.statusCode = 413;
      res.setHeader('Content-Type', 'text/plain; charset=utf-8');
      res.end('413 Payload Too Large\n');
      return;
    }

    console.error(`[${formatTimestamp()}] Ошибка чтения тела: ${err.message}`);
    res.statusCode = 500;
    res.end('Internal Server Error\n');
    return;
  }

  const { buffer, size } = bodyData;
  console.log(`[${formatTimestamp()}] ${req.method} ${req.url} (размер тела: ${size} байт)`);

  const contentType = (req.headers['content-type'] || '').toLowerCase();

  // Эндпоинт 1: POST /echo
  if (req.method === 'POST' && urlPath === '/echo') {
    if (contentType.includes('application/json')) {
      try {
        const json = JSON.parse(buffer.toString('utf-8'));
        json.group = 'ББМО-01-23';

        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json; charset=utf-8');
        res.end(JSON.stringify(json, null, 2) + '\n');
      } catch (parseErr) {
        res.statusCode = 400;
        res.setHeader('Content-Type', 'application/json; charset=utf-8');
        res.end(JSON.stringify({ error: 'Некорректный JSON' }) + '\n');
      }
      return;
    }

    if (contentType.includes('application/octet-stream')) {
      res.statusCode = 200;
      res.setHeader('Content-Type', 'application/octet-stream');
      res.end(buffer);
      return;
    }

    // Текстовый или любой другой формат
    res.statusCode = 200;
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.end(buffer.toString('utf-8') + '\n');
    return;
  }

  // Эндпоинт 2: POST /form — парсинг application/x-www-form-urlencoded
  if (req.method === 'POST' && urlPath === '/form') {
    const params = new URLSearchParams(buffer.toString('utf-8'));
    const formObject = Object.fromEntries(params.entries());

    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.end(JSON.stringify(formObject, null, 2) + '\n');
    return;
  }

  res.statusCode = 404;
  res.setHeader('Content-Type', 'text/plain; charset=utf-8');
  res.end('404 Not Found\n');
});

server.listen(PORT, () => {
  console.log(`Сервер чтения тела (POST) запущен на порту ${PORT}`);
});
