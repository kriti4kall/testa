import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
dotenv.config();

const dbConfig = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: 3306
};

async function runTask1() {
  console.log('=== Одиночное соединение ===');
  try {
    const connection = await mysql.createConnection(dbConfig);
    console.log('✔ Подключение установлено');
    const [rows] = await connection.execute('SELECT VERSION() as version');
    console.log(`Версия MySQL: ${rows[0].version}`);
    console.log(`Текущая БД: ${dbConfig.database}`);
    console.log(`Пользователь: ${dbConfig.user}@${dbConfig.host}`);
    await connection.end();
    console.log('✖ Соединение закрыто');
  } catch (err) {
    console.error('Ошибка:', err.message);
  }

  console.log('\n=== Пул соединений ===');
  try {
    const pool = mysql.createPool({ ...dbConfig, waitForConnections: true, connectionLimit: 10 });
    console.log('✔ Пул создан (лимит: 10)');
    const [rows] = await pool.execute('SELECT VERSION() as version');
    console.log(`Версия MySQL: ${rows[0].version}`);
    console.log(`Текущая БД: ${dbConfig.database}`);
    console.log('Соединений в пуле: 10');
    console.log('✔ Пул готов к работе');
    await pool.end();
  } catch (err) {
    console.error('Ошибка:', err.message);
  }
}

runTask1();
