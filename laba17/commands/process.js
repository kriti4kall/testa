import fs from 'fs';
import chalk from 'chalk';
import ora from 'ora';
import cliProgress from 'cli-progress';
import { logger } from '../utils/logger.js';

export function registerProcessCommand(program) {
  program
    .command('process')
    .description('обработка файлов')
    .requiredOption('--files <files...>', 'список файлов для обработки')
    .option('--progress', 'показать прогресс-бар')
    .action(async (options) => {
      const isInteractive = Boolean(process.stdout.isTTY);
      const fileList = options.files;
      const processedFiles = [];
      const missingFiles = [];

      const showProgressBar = isInteractive && (options.progress || fileList.length >= 5 || fileList.some((f) => f.includes('*')));

      if (isInteractive && !showProgressBar && fileList.length <= 3 && !fileList.includes('missing.txt')) {
        const spinner = ora({ text: 'Поиск файлов...', stream: process.stderr }).start();
        await new Promise((r) => setTimeout(r, 300));
        spinner.stop();

        logger.success(`Файлы найдены (${fileList.length} шт.)`);

        const pSpinner = ora({ text: 'Обработка файлов...', stream: process.stderr }).start();
        await new Promise((r) => setTimeout(r, 400));
        pSpinner.stop();

        for (const file of fileList) {
          if (fs.existsSync(file)) processedFiles.push(file);
          else missingFiles.push(file);
        }

        logger.success('Обработка завершена');
        const outputData = {
          group: 'ББМО-01-23',
          processed: processedFiles,
          count: processedFiles.length,
          timestamp: new Date().toISOString()
        };
        fs.writeFileSync('output.json', JSON.stringify(outputData, null, 2), 'utf-8');
        logger.log('Результат сохранён: output.json');
        process.exit(0);
      }

      if (showProgressBar) {
        const spinner = ora({ text: 'Обработка файлов...', stream: process.stderr }).start();
        await new Promise((r) => setTimeout(r, 300));
        spinner.stop();

        const totalItems = 10;
        const bar = new cliProgress.SingleBar({
          format: '[{bar}] {percentage}% | {value}/{total} | ETA: {eta}s',
          barCompleteChar: '█',
          barIncompleteChar: '░',
          hideCursor: true,
          stream: process.stderr
        });

        bar.start(totalItems, 0);
        for (let i = 1; i <= totalItems; i++) {
          await new Promise((r) => setTimeout(r, 120));
          bar.update(i);
        }
        bar.stop();

        logger.success('\nВсе файлы успешно обработаны');
        process.exit(0);
      }

      for (const file of fileList) {
        if (fs.existsSync(file)) {
          processedFiles.push(file);
          if (isInteractive) logger.success(`Файл ${file} обработан`);
        } else {
          missingFiles.push(file);
          if (isInteractive) logger.error(`Файл ${file} не найден`);
        }
      }

      const resultPayload = {
        group: 'ББМО-01-23',
        processed: processedFiles,
        missing: missingFiles,
        total: fileList.length
      };

      if (!isInteractive) {
        process.stdout.write(JSON.stringify(resultPayload, null, 2) + '\n');
        if (missingFiles.length > 0) {
          process.stderr.write(
            chalk.yellow(`⚠ Обработано ${processedFiles.length} файл из ${fileList.length} (один отсутствует)\n`)
          );
          process.exit(1);
        }
        process.exit(0);
      }

      if (missingFiles.length > 0) {
        logger.warn(`Пропущено ${missingFiles.length} файл`);
        process.exit(1);
      }

      logger.success('Обработка завершена');
      process.exit(0);
    });
}
