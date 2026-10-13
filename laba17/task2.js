

import { Command } from 'commander';

const program = new Command();

program
  .name('my-cli')
  .description('CLI-приложение для лабораторной работы №17')
  .version('1.0.0', '-V, --version', 'output the version number')
  .option('-v, --verbose', 'подробный вывод');

program
  .command('generate')
  .description('сгенерировать отчёт')
  .option('-t, --type <type>', 'тип отчёта (по умолчанию: "html")', 'html')
  .option('-o, --output <path>', 'путь для сохранения')
  .option('-f, --force', 'перезаписать существующий файл')
  .option('--dry-run', 'показать что будет сделано без выполнения')
  .action((options) => {
    const validTypes = ['html', 'pdf', 'json', 'csv'];

    if (!validTypes.includes(options.type)) {
      console.error(`Ошибка: недопустимый тип отчёта "${options.type}".\nДопустимые значения: ${validTypes.join(', ')}`);
      process.exit(1);
    }

    const outputPath = options.output || `./output.${options.type}`;
    const isVerbose = options.verbose || program.opts().verbose;

    if (options.dryRun) {
      console.log(`[DRY-RUN] Будет сгенерирован отчёт типа: ${options.type}`);
      console.log(`[DRY-RUN] Файл будет сохранён в: ${outputPath}`);
      console.log('[DRY-RUN] Действия не выполнены (режим проверки)');
      process.exit(0);
    }

    if (isVerbose) {
      console.log('[VERBOSE] Запуск генерации отчёта...');
      console.log(`[VERBOSE] Тип отчёта: ${options.type}`);
      console.log(`[VERBOSE] Путь сохранения: ${outputPath}`);
      if (options.force) {
        console.log('[VERBOSE] Флаг --force активен: перезапись существующего файла');
      }
    }

    console.log(`Отчёт успешно сгенерирован: ${outputPath}`);
    process.exit(0);
  });

program
  .command('convert')
  .description('конвертировать файл')
  .option('-s, --source <path>', 'путь к исходному файлу')
  .option('-t, --target <path>', 'путь к целевому файлу')
  .action((options) => {
    const isVerbose = program.opts().verbose;
    if (isVerbose) {
      console.log(`[VERBOSE] Конвертация из ${options.source || 'default'} в ${options.target || 'output'}`);
    }
    console.log('Конвертация успешно завершена');
    process.exit(0);
  });

program.parse(process.argv);
