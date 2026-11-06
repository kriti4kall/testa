import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
dotenv.config();

class StudentDAO {
  constructor(pool) {
    this.pool = pool;
  }

  async create(data) {
    if (!data.name || data.name.length < 2) throw new Error('name слишком короткое');
    if (!/ББМО-\d{2}-\d{2}/.test(data.group_name)) throw new Error('group_name формат ББМО-XX-XX');
    
    const [res] = await this.pool.execute(
      'INSERT INTO students (name, group_name, course, grade) VALUES (?, ?, ?, ?)',
      [data.name, data.group_name, data.course, data.grade]
    );
    return res.insertId;
  }

  async findAll(options = {}) {
    const limit = options.limit || 10;
    const offset = options.offset || 0;
    const [rows] = await this.pool.execute(
      'SELECT * FROM students LIMIT ? OFFSET ?',
      [limit, offset]
    );
    return rows;
  }
}

async function runTask4() {
  const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
  });

  const dao = new StudentDAO(pool);
  
  console.log('=== StudentDAO (группа 477) ===');
  try {
    const id = await dao.create({ name: 'Иван', group_name: 'ББМО-477', course: 2, grade: 4.5 });
    console.log(`✔ Создан: id=${id}`);
  } catch (err) {
    console.log(`✖ Ошибка: ${err.message}`);
  }
  
  const students = await dao.findAll({ limit: 5 });
  console.log('--- Пагинация ---');
  students.forEach(s => console.log(`id=${s.id}, name=${s.name}, group=${s.group_name}`));

  await pool.end();
}

runTask4().catch(console.error);
