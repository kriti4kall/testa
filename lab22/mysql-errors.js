import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
dotenv.config();

async function runTask3() {
  console.log('=== Демонстрация ошибок ===');
  const configs = [
    { ...process.env, port: 9999 }, // ETIMEDOUT/ECONNREFUSED
    { ...process.env, password: 'wrong' } // ER_ACCESS_DENIED_ERROR
  ];

  for (const conf of configs) {
    try {
      await mysql.createConnection({ host: conf.DB_HOST, user: conf.DB_USER, password: conf.password, port: conf.port || 3306 });
    } catch (err) {
      console.log(`[${err.code}] ${err.message}`);
    }
  }

  // Streaming - skipping actual huge data generation to keep context small, but demonstrating principle
  console.log('\n=== Потоковый запрос (демо) ===');
  const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
  });
  
  const connection = await pool.getConnection();
  const stream = connection.connection.query('SELECT * FROM students').stream();
  
  stream.on('data', (row) => console.log(`[STREAM] Получен студент: ${row.name}`));
  stream.on('end', () => {
    console.log('✔ Потоковое чтение завершено');
    connection.release();
    pool.end();
  });
}

runTask3().catch(console.error);
