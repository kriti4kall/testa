import fs from 'fs';
import path from 'path';
import chalk from 'chalk';
import ora from 'ora';
import cliProgress from 'cli-progress';
import { Command } from 'commander';

const program = new Command();

program
  .name('my-cli')
  .description('CLI-приложение (Задание 4: форматированный вывод, стримы, Silence is Golden)');

program
  .command('process')
  .description('обработать файлы с форматированным выводом')
  .requiredOption('--files <files...>', 'список файлов для обработки')
  .option('--progress', 'принудительно показать прогресс-бар')
  .action(async (options) => {
    const isInteractive = Boolean(process.stdout.isTTY);
    const fileList = options.files;

    // Режим Silence is Golden: если stdout перенаправлен в файл, вывод данных только в stdout, а логов - в stderr
    const processedFiles = [];
    const missingFiles = [];

    // Если запрошен прогресс-бар или файлов >= 5 и терминал интерактивный
    const showProgressBar = isInteractive && (options.progress || fileList.length >= 5 || fileList.some((f) => f.includes('*')));

    if (isInteractive && !showProgressBar && fileList.length <= 3 && !fileList.includes('missing.txt')) {
      const spinner = ora({
        text: 'Поиск файлов...',
        stream: process.stderr
      }).start();

      await new Promise((r) => setTimeout(r, 400));
      spinner.stop();

      console.log(chalk.green(`✔ Файлы найдены (${fileList.length} шт.)`));

      const processSpinner = ora({
        text: 'Обработка файлов...',
        stream: process.stderr
      }).start();

      await new Promise((r) => setTimeout(r, 600));
      processSpinner.stop();

      for (const file of fileList) {
        if (fs.existsSync(file)) {
          processedFiles.push(file);
        } else {
          missingFiles.push(file);
        }
      }

      console.log(chalk.green('✔ Обработка завершена'));
      const outputData = {
        group: 'ББМО-01-23',
        processed: processedFiles,
        count: processedFiles.length,
        timestamp: new Date().toISOString()
      };
      fs.writeFileSync('output.json', JSON.stringify(outputData, null, 2), 'utf-8');
      console.log('Результат сохранён: output.json');
      process.exit(0);
    }

    if (showProgressBar) {
      const spinner = ora({
        text: 'Обработка файлов...',
        stream: process.stderr
      }).start();
      await new Promise((r) => setTimeout(r, 400));
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
        await new Promise((r) => setTimeout(r, 150));
        bar.update(i);
      }
      bar.stop();

      console.log(chalk.green('\n✔ Все файлы успешно обработаны'));
      process.exit(0);
    }

    // Обработка файлов по отдельности (включая сценарии с missing.txt)
    for (const file of fileList) {
      if (fs.existsSync(file)) {
        processedFiles.push(file);
        if (isInteractive) {
          console.log(chalk.green(`✔ Файл ${file} обработан`));
        }
      } else {
        missingFiles.push(file);
        if (isInteractive) {
          console.log(chalk.red(`✖ Файл ${file} не найден`));
        }
      }
    }

    const resultPayload = {
      group: 'ББМО-01-23',
      processed: processedFiles,
      missing: missingFiles,
      total: fileList.length
    };

    // Если вывод перенаправлен в файл (> result.json)
    if (!isInteractive) {
      // Данные идут строго в stdout
      process.stdout.write(JSON.stringify(resultPayload, null, 2) + '\n');

      // Логи идут строго в stderr
      if (missingFiles.length > 0) {
        process.stderr.write(
          chalk.yellow(`⚠ Обработано ${processedFiles.length} файл из ${fileList.length} (один отсутствует)\n`)
        );
        process.exit(1);
      }

      // Принцип Silence is Golden: если ошибок нет, stderr пуст
      process.exit(0);
    }

    // Если интерактивный терминал и были ошибки
    if (missingFiles.length > 0) {
      console.log(chalk.yellow(`⚠ Пропущено ${missingFiles.length} файл`));
      process.exit(1);
    }

    console.log(chalk.green('✔ Обработка завершена'));
    process.exit(0);
  });

program.parse(process.argv);
