import { Readable } from 'stream';

class StudentReadableStream extends Readable {
  constructor(options = {}) {
    super({ ...options, encoding: 'utf-8' });
    this.chunks = [
      'Группа: ББМО-01-23',
      'Студент: ytisk',
      'Лабораторная работа: №21',
      'Тема: Потоки в Node.js'
    ];
    this.currentIndex = 0;
  }

  _read() {
    if (this.currentIndex < this.chunks.length) {
      const chunk = this.chunks[this.currentIndex];
      this.currentIndex += 1;
      this.push(chunk);
    } else {
      this.push(null);
    }
  }
}

console.log('=== Демонстрация Readable-потока ===');

const stream = new StudentReadableStream();
let chunkCount = 0;
let totalBytes = 0;

stream.on('data', (chunk) => {
  chunkCount += 1;
  totalBytes += Buffer.byteLength(chunk, 'utf-8');
  console.log(`[CHUNK ${chunkCount}] ${chunk}`);
});

stream.on('end', () => {
  console.log('\n[END] Поток завершён');
  console.log(`Всего получено чанков: ${chunkCount}`);
  console.log(`Общий размер данных: ${totalBytes} байт`);
});

stream.on('error', (err) => {
  console.error(`[ERROR] Ошибка потока: ${err.message}`);
});
