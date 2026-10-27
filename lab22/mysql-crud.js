import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
dotenv.config();

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  connectionLimit: 10
});

async function runTask2() {
  console.log('=== Создание таблицы ===');
  await pool.query(`DROP TABLE IF EXISTS students`);
  await pool.query(`
    CREATE TABLE students (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(100) NOT NULL,
      group_name VARCHAR(20) NOT NULL,
      course INT NOT NULL,
      grade DECIMAL(3,2),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
  `);
  console.log('✔ Таблица students создана');

  console.log('\n=== INSERT ===');
  const [res1] = await pool.execute(
    'INSERT INTO students (name, group_name, course, grade) VALUES (?, ?, ?, ?)',
    ['Иван', 'ББМО-477', 2, 4.5]
  );
  console.log(`✔ Вставлен студент: id=${res1.insertId}, affectedRows=${res1.affectedRows}`);

  const [res2] = await pool.execute(
    'INSERT INTO students (name, group_name, course, grade) VALUES (?, ?, ?, ?), (?, ?, ?, ?), (?, ?, ?, ?)',
    ['Мария', 'ББМО-477', 2, 3.8, 'Петр', 'ББМО-477', 2, 4.2, 'Анна', 'ББМО-477', 2, 4.7]
  );
  console.log(`✔ Вставлено 3 студента: affectedRows=${res2.affectedRows}`);

  console.log('\n=== SELECT ===');
  const [rows] = await pool.query('SELECT * FROM students');
  console.log('Все студенты:');
  rows.forEach(r => console.log(`id=${r.id}, name=${r.name}, group=${r.group_name}, grade=${r.grade}`));

  console.log('\nСтуденты группы ББМО-477 (сортировка по grade):');
  const [filtered] = await pool.execute(
    'SELECT * FROM students WHERE group_name = ? ORDER BY grade DESC',
    ['ББМО-477']
  );
  filtered.forEach(r => console.log(`id=${r.id}, name=${r.name}, grade=${r.grade}`));

  console.log('\n=== UPDATE ===');
  const [resU] = await pool.execute('UPDATE students SET grade = ? WHERE id = ?', [4.8, 1]);
  console.log(`✔ Обновлён студент id=1: affectedRows=${resU.affectedRows}, changedRows=${resU.changedRows}`);

  console.log('\n=== DELETE ===');
  const [resD] = await pool.execute('DELETE FROM students WHERE id = ?', [1]);
  console.log(`✔ Удалён студент id=1: affectedRows=${resD.affectedRows}`);

  await pool.end();
}

runTask2().catch(console.error);
