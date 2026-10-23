import { Writable } from 'stream';

class ConsoleWritableStream extends Writable {
  constructor(options = {}) {
    // Буфер 64 байта для демонстрации backpressure с двухбайтовой кириллицей
    super({ highWaterMark: 64, ...options });
    this.writtenChunks = 0;
  }

  _write(chunk, encoding, callback) {
    this.writtenChunks += 1;
    // Имитируем асинхронную задержку обработки данных
    setTimeout(callback, 70);
  }
}

console.log('=== Демонстрация Writable-потока ===');

const writable = new ConsoleWritableStream();

writable.on('drain', () => {
  console.log('[DRAIN] Буфер освобождён, продолжаем запись');
});

writable.on('finish', () => {
  console.log('\n[FINISH] Все данные записаны');
  console.log(`Всего записано: ${writable.writtenChunks} чанка`);
});

writable.on('error', (err) => {
  console.error(`[ERROR] Ошибка записи: ${err.message}`);
});

function writeData(chunk) {
  console.log(`[WRITE] ${chunk}`);
  const ok = writable.write(chunk);
  console.log(`write() вернул: ${ok ? 'true' : 'false ← буфер переполнен!'}`);
  return ok;
}

// Записываем первый чанк
writeData('Группа: ББМО-01-23');

// Быстро записываем следующие чанки, вызывая переполнение буфера (backpressure)
setTimeout(() => {
  writeData('Студент: ytisk');
  const bufferOk = writeData('Лабораторная работа: №21');

  if (!bufferOk) {
    // Буфер переполнен: ждем события drain перед записью следующей порции
    writable.once('drain', () => {
      writeData('Тема: Потоки в Node.js');
      writable.end();
    });
  } else {
    writeData('Тема: Потоки в Node.js');
    writable.end();
  }
}, 90);
