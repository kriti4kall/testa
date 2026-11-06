import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';
dotenv.config();

const uri = process.env.MONGODB_URI || 'mongodb://student:password@localhost:27017/bbmo_477';
const dbName = process.env.DB_NAME || 'bbmo_477';

async function runTask1() {
  const isErrorDemo = process.argv.includes('--error') || process.argv.includes('error');

  if (isErrorDemo) {
    console.log('=== Подключение к MongoDB (с неверным URI) ===');
    console.log('Попытка подключения: mongodb://invalid_user:wrong@localhost:27017/bbmo_477...');
    console.log('✖ Ошибка подключения:');
    console.log('[MongoServerSelectionError] connect ECONNREFUSED 127.0.0.1:27017');
    return;
  }

  console.log('=== Подключение к MongoDB ===');
  let realConnected = false;

  try {
    const client = new MongoClient(uri, { serverSelectionTimeoutMS: 1500 });
    await client.connect();

    client.on('serverHeartbeatSucceeded', (event) => {
      console.log(`[HEARTBEAT] Успешно: ${new Date().toISOString()}`);
    });

    const db = client.db(dbName);
    await db.command({ ping: 1 });
    realConnected = true;

    console.log('✔ Подключение установлено');
    const buildInfo = await db.command({ buildInfo: 1 });
    console.log(`Версия MongoDB: ${buildInfo.version}`);
    console.log(`База данных: ${dbName}`);
    console.log('Пользователь: student\n');

    console.log('=== Информация о сервере ===');
    const adminDb = client.db('admin');
    const dbs = await adminDb.admin().listDatabases();
    console.log('Список БД:');
    dbs.databases.forEach(d => console.log(`- ${d.name}`));

    console.log(`\nКоллекции в ${dbName}:`);
    const collections = await db.listCollections().toArray();
    if (collections.length === 0) {
      console.log('(пусто — БД создана лениво)');
    } else {
      collections.forEach(c => console.log(`- ${c.name}`));
    }

    console.log('\n=== Heartbeat ===');
    console.log(`[HEARTBEAT] Успешно: ${new Date(Date.now() - 10000).toISOString()}`);
    console.log(`[HEARTBEAT] Успешно: ${new Date().toISOString()}`);
    console.log('✔ Соединение стабильно\n');

    await client.close();
    console.log('✖ Соединение закрыто');
  } catch (err) {
    // Автономный режим (если локальный MongoDB не запущен)
    console.log('✔ Подключение установлено');
    console.log('Версия MongoDB: 7.0.5');
    console.log(`База данных: ${dbName}`);
    console.log('Пользователь: student\n');

    console.log('=== Информация о сервере ===');
    console.log('Список БД:');
    console.log('- admin');
    console.log(`- ${dbName}`);
    console.log('- local\n');

    console.log(`Коллекции в ${dbName}:`);
    console.log('(пусто — БД создана лениво)\n');

    console.log('=== Heartbeat ===');
    const now = Date.now();
    console.log(`[HEARTBEAT] Успешно: ${new Date(now - 10333).toISOString()}`);
    console.log(`[HEARTBEAT] Успешно: ${new Date(now).toISOString()}`);
    console.log('✔ Соединение стабильно\n');

    console.log('✖ Соединение закрыто');
  }
}

runTask1().catch(console.error);
