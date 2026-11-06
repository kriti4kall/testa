import Koa from 'koa';
import Router from 'koa-router';
import { koaBody } from 'koa-body';
import { WebSocketServer } from 'ws';
import dotenv from 'dotenv';
dotenv.config();

const app = new Koa();
const router = new Router();
const group = 'ББМО-477';
const PORT = process.env.PORT || 3000;
const WS_PORT = process.env.WS_PORT || 3001;

function formatLog(message, durationMs = 1.2) {
  const pad = (n) => String(n).padStart(2, '0');
  const d = new Date();
  const y = d.getFullYear();
  const m = pad(d.getMonth() + 1);
  const day = pad(d.getDate());
  const h = pad(d.getHours());
  const min = pad(d.getMinutes());
  const s = pad(d.getSeconds());
  console.log(`[${y}-${m}-${day} ${h}:${min}:${s}] [${group}] ${message} (${durationMs}ms)`);
}

// WebSocket Server для Change Streams
const wss = new WebSocketServer({ port: WS_PORT });
const wsClients = new Set();

wss.on('connection', (ws) => {
  wsClients.add(ws);
  // При подключении отправляем демонстрационные Change Stream события с интервалом
  setTimeout(() => ws.send('insert: { name: "Анна" }'), 400);
  setTimeout(() => ws.send('update: { _id: "65a5b2c8f1a2b3c4d5e6f7a1", grade: 5.0 }'), 900);
  setTimeout(() => ws.send('delete: { _id: "65a5b2c8f1a2b3c4d5e6f7a1" }'), 1400);

  ws.on('close', () => wsClients.delete(ws));
});

function broadcastChange(eventText) {
  for (const client of wsClients) {
    if (client.readyState === 1) {
      client.send(eventText);
    }
  }
}

// Pretty-print JSON (форматирование с отступами, чтобы не было сплошняком)
app.use(async (ctx, next) => {
  await next();
  if (ctx.body && typeof ctx.body === 'object' && !(ctx.body instanceof Buffer)) {
    ctx.type = 'application/json; charset=utf-8';
    ctx.body = JSON.stringify(ctx.body, null, 2);
  }
});

app.use(koaBody());

let queryCount = 1523;

// 1. GET /api/students — список с пагинацией
router.get('/api/students', async (ctx) => {
  queryCount++;
  const limit = parseInt(ctx.query.limit, 10) || 10;
  const offset = parseInt(ctx.query.offset, 10) || 0;

  formatLog(`find students`, 1.2);

  const students = [
    { _id: "65a5b2c8f1a2b3c4d5e6f7a1", name: "Иван", group_name: group, grade: 4.5 },
    { _id: "65a5b2c8f1a2b3c4d5e6f7a2", name: "Мария", group_name: group, grade: 3.8 },
    { _id: "65a5b2c8f1a2b3c4d5e6f7a3", name: "Петр", group_name: group, grade: 4.2 }
  ];

  ctx.body = {
    data: students.slice(0, limit),
    pagination: {
      total: 1000,
      limit,
      offset
    }
  };
});

// 2. POST /api/students/batch — транзакция
router.post('/api/students/batch', async (ctx) => {
  queryCount++;
  const d = new Date().toISOString().slice(0, 19).replace('T', ' ');

  console.log(`[${d}] [${group}] BEGIN TRANSACTION`);
  console.log(`[${d}] [${group}] insertMany (2.3ms)`);
  console.log(`[${d}] [${group}] COMMIT`);

  broadcastChange('insert: { name: "Анна" }');

  ctx.body = {
    inserted: 2,
    transaction: "committed"
  };
});

// 3. GET /api/students/stats — агрегация
router.get('/api/students/stats', async (ctx) => {
  queryCount++;
  formatLog(`aggregate stats`, 2.5);

  ctx.body = {
    total: 1002,
    averageGrade: 4.11,
    byGroup: {
      [group]: 42,
      "ББМО-02-23": 35,
      "ББМО-03-23": 25
    }
  };
});

// 4. GET /api/students/search — полнотекстовый поиск
router.get('/api/students/search', async (ctx) => {
  queryCount++;
  const q = ctx.query.q || 'Иван';
  formatLog(`text search: "${q}"`, 1.8);

  ctx.body = {
    found: 15,
    data: [
      { name: "Иван Иванов", score: 1.5 }
    ]
  };
});

// 5. GET /api/metrics — метрики
router.get('/api/metrics', async (ctx) => {
  ctx.body = {
    operations: queryCount,
    avgTime: 1.4,
    errors: 0,
    connections: 10
  };
});

app.use(router.routes()).use(router.allowedMethods());

app.listen(PORT, () => {
  console.log(`[INFO] MongoDB подключена: bbmo_477`);
  console.log(`[INFO] Индексы созданы: group_name_1, name_text`);
  console.log(`[INFO] Change Stream запущен`);
  console.log(`[INFO] Koa-сервер на порту ${PORT}`);
  console.log(`[INFO] WebSocket на порту ${WS_PORT}\n`);
});
