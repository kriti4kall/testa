import Koa from 'koa';
import Router from 'koa-router';
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
dotenv.config();

const app = new Koa();
const router = new Router();
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  connectionLimit: 10
});

// Middleware для внедрения пула
app.use(async (ctx, next) => {
  ctx.db = pool;
  await next();
});

router.get('/api/students', async (ctx) => {
  const [rows] = await ctx.db.query('SELECT * FROM students LIMIT 10');
  ctx.body = rows;
});

router.get('/api/students/stats', async (ctx) => {
  const [rows] = await ctx.db.query('SELECT AVG(grade) as averageGrade, COUNT(*) as total FROM students');
  ctx.body = rows[0];
});

app.use(router.routes()).use(router.allowedMethods());

app.listen(3000, () => {
  console.log('[INFO] Koa-сервер запущен на порту 3000');
});
