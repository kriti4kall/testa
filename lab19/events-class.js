

import { EventEmitter } from 'events';

class DatabaseConnection extends EventEmitter {
  connect() {
    console.log('[EVENT] Подключение к БД...');
    this.emit('connect');
  }

  query(sql) {
    console.log(`[EVENT] Выполнение запроса: ${sql}`);
    let result = 'успешно';
    if (sql.includes('SELECT')) {
      result = '50 записей';
    } else if (sql.includes('INSERT')) {
      result = '1 запись добавлена';
    }
    this.emit('query', sql, result);
  }

  close() {
    console.log('[EVENT] Закрытие соединения');
    this.emit('close');
  }

  error(message) {
    this.emit('error', new Error(message));
  }
}

// Если передан флаг --crash, демонстрируем падение без слушателя error
if (process.argv.includes('--crash')) {
  console.log('=== Демонстрация падения без слушателя error ===');
  const brokenDb = new DatabaseConnection();
  // Эмит ошибки без зарегистрированного обработчика вызывает unhandled exception в Node.js
  brokenDb.error('Uncaught fatal database error');
}

console.log('=== DatabaseConnection (группа ББМО-01-23) ===');

const db = new DatabaseConnection();

db.on('connect', () => {
  console.log('[EVENT] Соединение установлено');
});

db.on('query', (sql, result) => {
  console.log(`[EVENT] Результат: ${result}`);
});

db.on('close', () => {
  console.log('[EVENT] Соединение закрыто');
});

db.connect();
db.query('SELECT * FROM students');
db.query('INSERT INTO students');
db.close();

console.log('\n=== Демонстрация ошибки ===');

const errorDb = new DatabaseConnection();

errorDb.on('error', (err) => {
  console.log(`[EVENT] Ошибка: ${err.message}`);
  console.log('(без слушателя error — процесс упал бы с исключением)');
});

errorDb.error('Connection timeout');
