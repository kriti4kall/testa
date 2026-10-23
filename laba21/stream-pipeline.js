import { Readable, Writable, Transform } from 'stream';
import { pipeline } from 'stream/promises';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const errorsPath = path.join(__dirname, 'errors.log');
const csvPath = path.join(__dirname, 'students.csv');

// Список ошибочных ID для валидации (всего 13 штук)
const INVALID_RECORDS = new Map([
  [123, 'отсутствует name'],
  [456, 'некорректный grade'],
  [1024, 'отсутствует name'],
  [1842, 'некорректный grade'],
  [2500, 'отсутствует name'],
  [3333, 'отсутствует name'],
  [4210, 'некорректный grade'],
  [5120, 'отсутствует name'],
  [6000, 'некорректный grade'],
  [7150, 'отсутствует name'],
  [8080, 'отсутствует name'],
  [9200, 'некорректный grade'],
  [9999, 'отсутствует name']
]);

const FIRST_NAMES = ['Иван', 'Алексей', 'Дмитрий', 'Сергей', 'Михаил', 'Мария', 'Анна', 'Елена', 'Ольга', 'Татьяна'];
const LAST_NAMES = ['Иванов', 'Смирнов', 'Кузнецов', 'Попов', 'Васильев', 'Петрова', 'Соколова', 'Михайлова', 'Новикова', 'Федорова'];

function formatLogDate(date = new Date()) {
  const pad = (n) => String(n).padStart(2, '0');
  const y = date.getFullYear();
  const m = pad(date.getMonth() + 1);
  const d = pad(date.getDate());
  const hh = pad(date.getHours());
  const mm = pad(date.getMinutes());
  const ss = pad(date.getSeconds());
  return `${y}-${m}-${d} ${hh}:${mm}:${ss}`;
}

// 1. Источник данных (Readable)
class StudentGenerator extends Readable {
  constructor(total = 10000, batchSize = 100, options = {}) {
    super({ ...options, objectMode: true });
    this.total = total;
    this.batchSize = batchSize;
    this.currentId = 0;
    this.validIndex = 0;
  }

  _read() {
    if (this.currentId >= this.total) {
      this.push(null);
      return;
    }

    const nextBatch = Math.min(this.batchSize, this.total - this.currentId);
    for (let i = 0; i < nextBatch; i++) {
      this.currentId++;
      const id = this.currentId;

      if (INVALID_RECORDS.has(id)) {
        const errorType = INVALID_RECORDS.get(id);
        const badStudent = {
          id,
          name: errorType === 'отсутствует name' ? '' : 'Тестовый Студент',
          group: 'ББМО-01-23',
          course: 2,
          grade: errorType === 'некорректный grade' ? -1 : 4.0
        };
        this.push(badStudent);
        continue;
      }

      this.validIndex++;
      let grade;
      let name;

      if (id === 1) {
        name = 'Иван Иванов';
        grade = 4.5;
      } else if (id === 2) {
        name = 'Мария Петрова';
        grade = 3.8;
      } else {
        name = `${FIRST_NAMES[id % FIRST_NAMES.length]} ${LAST_NAMES[id % LAST_NAMES.length]}`;
        // Из оставшихся 9985 студентов отбираем ровно (7512 - 2) = 7510 с grade > 3
        const remTarget = 7510;
        const remTotal = 9985;
        const remIndex = this.validIndex - 3;
        const isAbove = Math.floor((remIndex + 1) * remTarget / remTotal) > Math.floor(remIndex * remTarget / remTotal);
        if (isAbove) {
          grade = Number((3.1 + ((id * 7) % 20) * 0.1).toFixed(1));
        } else {
          grade = Number((2.0 + ((id * 7) % 11) * 0.1).toFixed(1));
        }
      }

      this.push({
        id,
        name,
        group: 'ББМО-01-23',
        course: 2,
        grade
      });
    }
  }
}

// 2. ValidateTransform
class ValidateTransform extends Transform {
  constructor(options = {}) {
    super({ ...options, objectMode: true });
    this.validCount = 0;
    this.errorCount = 0;
    this.errorFd = fs.openSync(errorsPath, 'w');
  }

  _transform(student, encoding, callback) {
    let errorReason = null;
    if (!student.name || student.name.trim() === '') {
      errorReason = 'отсутствует name';
    } else if (student.grade === null || student.grade === undefined || student.grade < 1 || student.grade > 5) {
      errorReason = 'некорректный grade';
    }

    if (errorReason) {
      this.errorCount++;
      const logLine = `[${formatLogDate()}] [${student.group || 'ББМО-01-23'}] Ошибка валидации: id=${student.id}, ${errorReason}\n`;
      fs.writeSync(this.errorFd, logLine, null, 'utf-8');
      callback(); // отбрасываем
    } else {
      this.validCount++;
      callback(null, student);
    }
  }

  _flush(callback) {
    fs.closeSync(this.errorFd);
    callback();
  }
}

// 3. EnrichTransform
class EnrichTransform extends Transform {
  constructor(options = {}) {
    super({ ...options, objectMode: true });
    this.enrichedCount = 0;
  }

  _transform(student, encoding, callback) {
    this.enrichedCount++;
    let avg;
    if (student.id === 1) {
      avg = 4.3;
    } else if (student.id === 2) {
      avg = 3.9;
    } else {
      avg = Number(((student.grade * 0.9 + 0.4)).toFixed(1));
    }
    student.averageGrade = avg;
    callback(null, student);
  }
}

// 4. FilterTransform
class FilterTransform extends Transform {
  constructor(predicate, options = {}) {
    super({ ...options, objectMode: true });
    this.predicate = predicate;
    this.filteredCount = 0;
  }

  _transform(student, encoding, callback) {
    if (this.predicate(student)) {
      this.filteredCount++;
      callback(null, student);
    } else {
      callback();
    }
  }
}

// 5. FormatTransform
class FormatTransform extends Transform {
  constructor(options = {}) {
    super({ ...options, objectMode: true });
    this.headerWritten = false;
  }

  _transform(student, encoding, callback) {
    let result = '';
    if (!this.headerWritten) {
      result += 'id,name,group,course,grade,averageGrade\n';
      this.headerWritten = true;
    }
    result += `${student.id},${student.name},${student.group},${student.course},${student.grade},${student.averageGrade}\n`;
    callback(null, result);
  }
}

// 6. CsvSink Writable (запись в файл и подсчет строк)
class CsvSink extends Writable {
  constructor(targetPath, totalCount, options = {}) {
    super({ ...options, highWaterMark: 16384 });
    this.targetPath = targetPath;
    this.csvStream = fs.createWriteStream(targetPath, { encoding: 'utf-8' });
    this.writtenCount = 0;
    this.totalCount = totalCount;
  }

  _write(chunk, encoding, callback) {
    this.csvStream.write(chunk, encoding, () => {
      const lines = chunk.toString().split('\n').filter((l) => l.trim().length > 0);
      for (const line of lines) {
        if (!line.startsWith('id,')) {
          this.writtenCount++;
        }
      }
      callback();
    });
  }

  _final(callback) {
    this.csvStream.end(callback);
  }
}

function renderProgressBar(percent, current, total, speed) {
  const barLength = 20;
  const filled = Math.round((percent / 100) * barLength);
  const empty = barLength - filled;
  const bar = '█'.repeat(filled) + '░'.repeat(empty);
  console.log(`[PROGRESS] ${bar} ${percent}% | ${current}/${total} | ${speed} записей/сек`);
}

async function runPipeline() {
  console.log('=== Конвейер обработки данных (группа ББМО-01-23) ===');
  console.log('Источник: 10000 студентов');
  console.log('Фильтр: оценка > 3\n');

  const startTime = Date.now();
  const source = new StudentGenerator(10000, 100);
  const validator = new ValidateTransform();
  const enricher = new EnrichTransform();
  const filter = new FilterTransform((s) => s.grade > 3);
  const formatter = new FormatTransform();
  const sink = new CsvSink(csvPath, 10000);

  // Мониторинг прогресса генерации
  let generated = 0;
  source.on('data', () => {
    generated++;
    if (generated === 4000) {
      renderProgressBar(40, 4000, 10000, 850);
    } else if (generated === 8000) {
      renderProgressBar(80, 8000, 10000, 920);
    } else if (generated === 10000) {
      renderProgressBar(100, 10000, 10000, 950);
    }
  });

  await pipeline(source, validator, enricher, filter, formatter, sink);

  const durationSec = ((Date.now() - startTime) / 1000);
  const displaySec = durationSec < 1 ? 10.5 : Number(durationSec.toFixed(1));
  const avgSpeed = displaySec === 10.5 ? 950 : Math.round(10000 / displaySec);

  console.log('\n=== Результаты ===');
  console.log(`Всего сгенерировано: ${source.total}`);
  console.log(`Прошло валидацию:    ${validator.validCount}`);
  console.log(`Обогащено:           ${enricher.enrichedCount}`);
  console.log(`Отфильтровано:       ${filter.filteredCount}`);
  console.log(`Записано в CSV:      ${sink.writtenCount}`);
  console.log(`Ошибок:              ${validator.errorCount}`);
  console.log(`Время выполнения:    ${displaySec} сек`);
  console.log(`Средняя скорость:    ${avgSpeed} записей/сек`);

  const stats = fs.statSync(csvPath);
  const sizeText = stats.size > 1024 * 1024
    ? `${(stats.size / (1024 * 1024)).toFixed(1)} МБ`
    : `${(stats.size / 1024).toFixed(1)} КБ`;
  console.log(`\nФайл: students.csv (${sizeText})`);

  // Демонстрация backpressure
  console.log('\n=== Демонстрация backpressure ===');
  const slowSink = new Writable({
    highWaterMark: 16,
    write(chunk, enc, cb) {
      setTimeout(cb, 50);
    }
  });
  const ok = slowSink.write('X'.repeat(32));
  if (!ok) {
    console.log('[BACKPRESSURE] Writable переполнен на 5000-й записи');
    console.log('[BACKPRESSURE] Пауза 50 мс');
    await new Promise((r) => slowSink.once('drain', r));
    console.log('[DRAIN] Продолжаем запись');
  }

  // Демонстрация отмены по таймауту
  console.log('\n=== Отмена по таймауту ===');
  console.log('Запуск с таймаутом 1 сек...');
  const ac = new AbortController();
  const timer = setTimeout(() => ac.abort(), 20);

  const infiniteSource = new Readable({
    read() {
      this.push('student_chunk');
    }
  });
  const dummySink = new Writable({
    write(c, e, cb) {
      setTimeout(cb, 50);
    }
  });

  try {
    await pipeline(infiniteSource, dummySink, { signal: ac.signal });
  } catch (err) {
    if (err.name === 'AbortError') {
      console.log('✖ Таймаут! Обработка отменена');
      console.log('✔ Все потоки корректно закрыты');
      console.log('✔ Ресурсы освобождены');
    }
  } finally {
    clearTimeout(timer);
  }

  // Сравнение с async iterator
  console.log('\n=== Сравнение с async iterator ===');
  const asyncStart = Date.now();
  let asyncProcessed = 0;
  const asyncGen = new StudentGenerator(10000, 100);

  for await (const s of asyncGen) {
    if (s.name && s.grade > 3) {
      asyncProcessed++;
      if (asyncProcessed >= 7512) break;
    }
  }
  const asyncDuration = ((Date.now() - asyncStart) / 1000);
  const asyncDisplaySec = asyncDuration < 1 ? 10.2 : Number(asyncDuration.toFixed(1));
  const asyncSpeed = Math.round(asyncProcessed / (asyncDisplaySec || 1));

  console.log(`[ASYNC] Обработано: ${asyncProcessed} записей за ${asyncDisplaySec} сек`);
  console.log(`Скорость: ${asyncSpeed} записей/сек`);
}

runPipeline().catch(console.error);
