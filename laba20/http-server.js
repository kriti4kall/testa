import http from 'http';

const PORT = process.env.PORT || 3000;

function formatTimestamp(date = new Date()) {
  const pad = (num) => String(num).padStart(2, '0');
  const dateStr = `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
  const timeStr = `${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
  return `${dateStr} ${timeStr}`;
}

const server = http.createServer((req, res) => {
  const urlPath = req.url.split('?')[0];

  res.on('finish', () => {
    console.log(`[${formatTimestamp()}] ${req.method} ${req.url} ${res.statusCode}`);
  });

  res.setHeader('Content-Type', 'text/html; charset=utf-8');

  if (req.method === 'GET' && urlPath === '/') {
    res.statusCode = 200;
    res.end(`<!DOCTYPE html>
<html lang="ru">
<head><meta charset="utf-8"><title>Лабораторная работа №20</title></head>
<body style="font-family: monospace; white-space: pre; margin: 20px;">=== Лабораторная работа №20 ===
Группа: ББМО-01-23
Метод: ${req.method}
URL: ${req.url}</body>
</html>`);
    return;
  }

  if (req.method === 'GET' && urlPath === '/about') {
    res.statusCode = 200;
    res.end(`<!DOCTYPE html>
<html lang="ru">
<head><meta charset="utf-8"><title>О студенте</title></head>
<body style="font-family: monospace; white-space: pre; margin: 20px;">=== О студенте ===
Группа: ББМО-01-23
Студент: ytisk
URL: ${req.url}</body>
</html>`);
    return;
  }

  res.statusCode = 404;
  res.end(`<!DOCTYPE html>
<html lang="ru">
<head><meta charset="utf-8"><title>404 Not Found</title></head>
<body style="font-family: monospace; white-space: pre; margin: 20px;">=== 404 Not Found ===
Путь ${req.url} не найден</body>
</html>`);
});

server.listen(PORT, () => {
  console.log(`Сервер запущен на порту ${PORT}`);
});
