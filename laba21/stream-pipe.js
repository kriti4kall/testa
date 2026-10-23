import fs from 'fs';
import { pipeline, Transform } from 'stream';

function runPipeSuccess() {
  return new Promise((resolve) => {
    console.log('=== Демонстрация pipe() ===');
    console.log('Чтение: input.txt');
    console.log('Запись: output-pipe.txt');

    const source = fs.createReadStream('input.txt');
    const destination = fs.createWriteStream('output-pipe.txt');

    source.pipe(destination);

    destination.on('finish', () => {
      console.log('✔ Копирование завершено');
      const stats = fs.statSync('output-pipe.txt');
      console.log(`Размер: ${stats.size} байт\n`);
      resolve();
    });
  });
}

function runPipeWithError() {
  return new Promise((resolve) => {
    console.log('=== Демонстрация pipe() с ошибкой ===');
    console.log('Чтение: missing.txt');

    const source = fs.createReadStream('missing.txt');
    const destination = fs.createWriteStream('output-pipe-leak.txt');

    source.on('error', (err) => {
      const errorText = err.message.includes('ENOENT')
        ? 'ENOENT: no such file or directory'
        : err.message;
      console.log(`✖ Ошибка: ${errorText}`);

      // В стандартном pipe() целевой поток не закрывается автоматически при ошибке источника
      if (!destination.destroyed) {
        console.log('⚠ Внимание: pipe() не закрыл целевой поток!');
        console.log('⚠ Возможна утечка памяти.\n');
        destination.destroy();
      }
      resolve();
    });

    source.pipe(destination);
  });
}

function runPipelineSuccess() {
  return new Promise((resolve) => {
    console.log('=== Демонстрация pipeline() ===');
    console.log('Чтение: input.txt');
    console.log('Запись: output-pipeline.txt');

    pipeline(
      fs.createReadStream('input.txt'),
      fs.createWriteStream('output-pipeline.txt'),
      (err) => {
        if (!err) {
          console.log('✔ Копирование завершено\n');
        }
        resolve();
      }
    );
  });
}

function runPipelineWithError() {
  return new Promise((resolve) => {
    console.log('=== Демонстрация pipeline() с ошибкой ===');
    console.log('Чтение: missing.txt');

    const destination = fs.createWriteStream('output-pipeline-test.txt');

    pipeline(
      fs.createReadStream('missing.txt'),
      destination,
      (err) => {
        if (err) {
          const errorText = err.message.includes('ENOENT')
            ? 'ENOENT: no such file or directory'
            : err.message;
          console.log(`✖ Ошибка: ${errorText}`);

          // pipeline() гарантированно закрывает все потоки конвейера
          if (destination.destroyed) {
            console.log('✔ Все потоки автоматически закрыты');
            console.log('✔ Утечек нет\n');
          }
        }
        resolve();
      }
    );
  });
}

function runTransformChain() {
  return new Promise((resolve, reject) => {
    console.log('=== Цепочка потоков ===');
    console.log('input.txt → uppercase → reverse → output-chain.txt');

    const uppercase = new Transform({
      transform(chunk, encoding, callback) {
        callback(null, chunk.toString('utf-8').toUpperCase());
      }
    });

    const reverse = new Transform({
      transform(chunk, encoding, callback) {
        const text = chunk.toString('utf-8');
        const reversed = text.split('').reverse().join('');
        callback(null, reversed);
      }
    });

    pipeline(
      fs.createReadStream('input.txt'),
      uppercase,
      reverse,
      fs.createWriteStream('output-chain.txt'),
      (err) => {
        if (err) {
          return reject(err);
        }
        console.log('✔ Обработка завершена');
        resolve();
      }
    );
  });
}

async function run() {
  await runPipeSuccess();
  await runPipeWithError();
  await runPipelineSuccess();
  await runPipelineWithError();
  await runTransformChain();
}

run().catch((err) => {
  console.error('Непредвиденная ошибка:', err);
});
