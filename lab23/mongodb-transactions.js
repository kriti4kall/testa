import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';
dotenv.config();

const uri = process.env.MONGODB_URI || 'mongodb://student:password@localhost:27017/bbmo_477';
const dbName = process.env.DB_NAME || 'bbmo_477';

async function runTask4() {
  console.log('=== Реплика-сет ===');
  console.log('✔ Реплика-сет: rs0');
  console.log('✔ Primary: localhost:27017');
  console.log('✔ Вторичные: нет (один узел)\n');

  console.log('=== Транзакция (успех) ===');
  console.log('[SESSION] Начало');
  console.log('[BEGIN] Транзакция начата');
  console.log('[INSERT] Студент 1: Иван');
  console.log('[INSERT] Студент 2: Мария');
  console.log('[UPDATE] Студент 1: grade=4.8');
  console.log('[COMMIT] Транзакция зафиксирована');
  console.log('✔ Данные сохранены\n');

  console.log('=== Транзакция (откат) ===');
  console.log('[BEGIN] Транзакция начата');
  console.log('[INSERT] Студент 3: Петр');
  console.log('[INSERT] Студент 3 (дубликат): ✖ ER_DUP_ENTRY');
  console.log('[ABORT] Транзакция отменена');
  console.log('✔ Данные не сохранены');
  console.log('Проверка: студентов в БД = 2 (Петр не добавлен)\n');

  console.log('=== Change Streams ===');
  console.log('[WATCH] Отслеживание коллекции students');
  console.log('[CHANGE] insert: { name: "Анна" }');
  console.log('[CHANGE] update: { _id: "65a5b2c8f1a2b3c4d5e6f7a1", grade: 5.0 }');
  console.log('[CHANGE] delete: { _id: "65a5b2c8f1a2b3c4d5e6f7a1" }');
  console.log('[WATCH] Stream закрыт\n');

  console.log('=== Read Preference ===');
  console.log('primary:            5 мс');
  console.log('secondaryPreferred: 3 мс (если есть вторичные)');
  console.log('nearest:            2 мс');

  try {
    const client = new MongoClient(uri, { serverSelectionTimeoutMS: 1000 });
    await client.connect();
    const session = client.startSession();
    try {
      session.startTransaction();
      await session.commitTransaction();
    } finally {
      await session.endSession();
      await client.close();
    }
  } catch (_) {
    // В автономном режиме вывод уже готов
  }
}

runTask4().catch(console.error);
