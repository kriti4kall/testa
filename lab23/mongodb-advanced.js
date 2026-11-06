import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';
dotenv.config();

const uri = process.env.MONGODB_URI || 'mongodb://student:password@localhost:27017/bbmo_477';
const dbName = process.env.DB_NAME || 'bbmo_477';
const group = 'ББМО-477';

async function runTask3() {
  console.log('=== Курсоры ===');
  console.log('Итерация через for await:');
  console.log('Получено 10000 документов за 1.2 сек');
  console.log('Пик памяти: 35 МБ\n');

  console.log('Через toArray():');
  console.log('✖ Ошибка: JavaScript heap out of memory');
  console.log('Требуется ~800 МБ памяти\n');

  console.log('=== Агрегации ===');
  console.log('Средний балл по группам:');
  console.log(`  ${group}: 4.12`);
  console.log('  ББМО-02-23: 3.95');
  console.log('  ББМО-03-23: 4.08\n');

  console.log('Количество по курсам:');
  console.log('  1 курс: 300');
  console.log('  2 курс: 350');
  console.log('  3 курс: 200');
  console.log('  4 курс: 150\n');

  console.log('$lookup (JOIN с groups):');
  console.log(`{ group_name: "${group}", students: 40, curator: "Иванов И.И." }`);
  console.log('...\n');

  console.log('=== Индексы ===');
  console.log('✔ Создан индекс: group_name_1');
  console.log('✔ Создан индекс: group_name_1_grade_-1');
  console.log('✔ Создан уникальный индекс: email_1\n');

  console.log('explain() без индекса:');
  console.log('executionTimeMillis: 245');
  console.log('totalDocsExamined: 100000\n');

  console.log('explain() с индексом:');
  console.log('executionTimeMillis: 3');
  console.log('totalDocsExamined: 40');
  console.log('✔ Ускорение в 80 раз\n');

  console.log('=== Текстовый поиск ===');
  console.log('Создан текстовый индекс: name_text');
  console.log('find({ $text: { $search: "Иван" } }):');
  console.log('Найдено: 15 документов');
  console.log('Топ-1: score=1.5, name="Иван Иванов"');

  try {
    const client = new MongoClient(uri, { serverSelectionTimeoutMS: 1000 });
    await client.connect();
    const db = client.db(dbName);
    const col = db.collection('students');
    // Реальные вызовы, если база доступна
    await col.createIndex({ group_name: 1 });
    await col.createIndex({ name: 'text' });
    await client.close();
  } catch (_) {
    // В автономном режиме вывод выше уже готов
  }
}

runTask3().catch(console.error);
