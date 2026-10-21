import { Transform, Readable, Writable, pipeline } from 'stream';

// 1. Transform-поток UpperCaseTransform
class UpperCaseTransform extends Transform {
  _transform(chunk, encoding, callback) {
    const text = chunk.toString('utf-8').trim().toUpperCase();
    callback(null, `[BBMO-01-23] ${text}`);
  }
}

// 2. Transform-поток JsonParserTransform (работает в objectMode)
class JsonParserTransform extends Transform {
  constructor(options = {}) {
    super({ ...options, objectMode: true });
  }

  _transform(chunk, encoding, callback) {
    try {
      const parsed = JSON.parse(chunk.toString('utf-8'));
      callback(null, parsed);
    } catch (err) {
      callback(err);
    }
  }
}

// 3. Transform-поток FilterTransform
class FilterTransform extends Transform {
  constructor(predicate, options = {}) {
    super({ ...options, objectMode: true });
    this.predicate = predicate;
  }

  _transform(chunk, encoding, callback) {
    if (this.predicate(chunk)) {
      callback(null, chunk);
    } else {
      callback(); // отфильтровано
    }
  }
}

async function runDemo() {
  // Демонстрация 1: UpperCaseTransform
  console.log('=== Демонстрация Transform-потока ===');

  const upper1 = new UpperCaseTransform();
  const input1 = 'группа ббмо-01-23';
  upper1.on('data', (data) => {
    console.log(`Вход: "${input1}"`);
    console.log(`Выход: "${data.toString('utf-8')}"\n`);
  });
  upper1.write(input1);
  upper1.end();
  await new Promise((r) => upper1.on('finish', r));

  const upper2 = new UpperCaseTransform();
  const input2 = 'студент иванов';
  upper2.on('data', (data) => {
    console.log(`Вход: "${input2}"`);
    console.log(`Выход: "${data.toString('utf-8')}"`);
  });
  upper2.write(input2);
  upper2.end();
  await new Promise((r) => upper2.on('finish', r));

  // Демонстрация 2: JsonParserTransform
  console.log('\n=== Демонстрация JsonParserTransform ===');
  const jsonParser = new JsonParserTransform();
  const sampleJson = '{"id": 1, "name": "Иван", "group": "ББМО-01-23"}';
  console.log(`Входная строка: '${sampleJson}'`);
  jsonParser.on('data', (obj) => {
    console.log(`Распарсенный объект:`, obj);
  });
  jsonParser.write(sampleJson);
  jsonParser.end();
  await new Promise((r) => jsonParser.on('finish', r));

  // Демонстрация 3: Object Mode & FilterTransform
  console.log('\n=== Демонстрация Object Mode ===');
  const sampleStudents = [
    { id: 1, name: 'Иван', group: 'ББМО-01-23' },
    { id: 2, name: 'Мария', group: 'ББМО-02-23' },
    { id: 3, name: 'Петр', group: 'ББМО-01-23' }
  ];

  for (const s of sampleStudents) {
    console.log(`[OBJECT] { id: ${s.id}, name: "${s.name}", group: "${s.group}" }`);
  }

  console.log('\nПосле фильтрации (только ББМО-01-23):');
  const objectSource = Readable.from(sampleStudents, { objectMode: true });
  const filterStream = new FilterTransform((s) => s.group === 'ББМО-01-23');

  filterStream.on('data', (s) => {
    console.log(`[OBJECT] { id: ${s.id}, name: "${s.name}", group: "${s.group}" }`);
  });

  objectSource.pipe(filterStream);
  await new Promise((r) => filterStream.on('finish', r));

  // Демонстрация 4: async iterator
  console.log('\n=== Демонстрация async iterator ===');
  const asyncDataSource = Readable.from(['Данные 1', 'Данные 2', 'Данные 3']);
  let chunkIdx = 1;

  for await (const chunk of asyncDataSource) {
    console.log(`[ASYNC] Получен чанк ${chunkIdx}: "${chunk}"`);
    chunkIdx += 1;
  }
  console.log('[ASYNC] Поток завершён');

  // Демонстрация 5: Цепочка Transform
  console.log('\n=== Цепочка Transform ===');
  console.log('Читаем → UpperCase → Filter → Записываем');

  // Генерируем 10 тестовых строк
  const lines = [
    'студент 1 (ББМО-01-23)',
    'студент 2 (ББМО-01-23)',
    'студент 3 (ББМО-02-23)',
    'студент 4 (ББМО-01-23)',
    'студент 5 (ББМО-01-23)',
    'студент 6 (ББМО-03-23)',
    'студент 7 (ББМО-01-23)',
    'студент 8 (ББМО-01-23)',
    'студент 9 (ББМО-02-23)',
    'студент 10 (ББМО-01-23)'
  ];

  let processedCount = 0;
  let filteredCount = 0;

  const chainSource = Readable.from(lines);
  const chainUpper = new Transform({
    transform(chunk, enc, cb) {
      processedCount += 1;
      cb(null, chunk.toString().toUpperCase());
    }
  });

  const chainFilter = new Transform({
    transform(chunk, enc, cb) {
      const str = chunk.toString();
      if (str.includes('01-23')) {
        filteredCount += 1;
        cb(null, str + '\n');
      } else {
        cb();
      }
    }
  });

  const chainSink = new Writable({
    write(chunk, enc, cb) {
      cb();
    }
  });

  await new Promise((resolve, reject) => {
    pipeline(chainSource, chainUpper, chainFilter, chainSink, (err) => {
      if (err) return reject(err);
      console.log(`✔ Обработано ${processedCount} строк, отфильтровано ${filteredCount}`);
      resolve();
    });
  });
}

runDemo().catch(console.error);
