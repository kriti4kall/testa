import http from 'http';
import { URL } from 'url';

const PORT = process.env.PORT || 3000;

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

let students = [
  { id: 1, name: 'Иван', group: 'ББМО-01-23' },
  { id: 2, name: 'Мария', group: 'ББМО-01-23' }
];
let nextId = 3;

function readJsonBody(req) {
  return new Promise((resolve) => {
    let body = '';
    req.on('data', (chunk) => {
      body += chunk;
    });
    req.on('end', () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch {
        resolve({});
      }
    });
  });
}

const server = http.createServer(async (req, res) => {
  const parsedUrl = new URL(req.url, `http://${req.headers.host || 'localhost:3000'}`);
  const pathname = parsedUrl.pathname;
  const method = req.method;

  res.on('finish', () => {
    console.log(`[${formatTimestamp()}] [ББМО-01-23] ${method} ${req.url} ${res.statusCode}`);
  });

  res.setHeader('Content-Type', 'application/json; charset=utf-8');

  // Маршрут: /api/students/:id
  const studentIdMatch = pathname.match(/^\/api\/students\/(\d+)$/);
  if (studentIdMatch) {
    const studentId = parseInt(studentIdMatch[1], 10);
    const studentIndex = students.findIndex((s) => s.id === studentId);

    if (method === 'GET') {
      if (studentIndex === -1) {
        res.statusCode = 404;
        res.end(JSON.stringify({ error: 'Студент не найден' }) + '\n');
        return;
      }
      res.statusCode = 200;
      res.end(JSON.stringify(students[studentIndex], null, 2) + '\n');
      return;
    }

    if (method === 'PUT') {
      if (studentIndex === -1) {
        res.statusCode = 404;
        res.end(JSON.stringify({ error: 'Студент не найден' }) + '\n');
        return;
      }
      const updateData = await readJsonBody(req);
      students[studentIndex] = { ...students[studentIndex], ...updateData, id: studentId };
      res.statusCode = 200;
      res.end(JSON.stringify(students[studentIndex], null, 2) + '\n');
      return;
    }

    if (method === 'DELETE') {
      if (studentIndex === -1) {
        res.statusCode = 404;
        res.end(JSON.stringify({ error: 'Студент не найден' }) + '\n');
        return;
      }
      students.splice(studentIndex, 1);
      res.statusCode = 200;
      res.end(JSON.stringify({ deleted: true, id: studentId }) + '\n');
      return;
    }

    // 405 Method Not Allowed (например, PATCH)
    res.statusCode = 405;
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.end('405 Method Not Allowed\n');
    return;
  }

  // Маршрут: /api/students
  if (pathname === '/api/students') {
    if (method === 'GET') {
      const groupQuery = parsedUrl.searchParams.get('group');
      let result = students;

      if (groupQuery) {
        result = students.filter((s) => s.group === groupQuery);
      }

      res.statusCode = 200;
      res.end(JSON.stringify(result, null, 2) + '\n');
      return;
    }

    if (method === 'POST') {
      const body = await readJsonBody(req);
      const newStudent = {
        id: nextId++,
        name: body.name || 'Новый студент',
        group: body.group || 'ББМО-01-23'
      };
      students.push(newStudent);
      res.statusCode = 201;
      res.end(JSON.stringify(newStudent, null, 2) + '\n');
      return;
    }

    res.statusCode = 405;
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.end('405 Method Not Allowed\n');
    return;
  }

  res.statusCode = 404;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.end(JSON.stringify({ error: 'Маршрут не найден', url: pathname }) + '\n');
});

server.listen(PORT, () => {
  console.log(`Сервер маршрутизации запущен на порту ${PORT}`);
  console.log('Эндпоинты: /api/students, /api/students/:id');
});
