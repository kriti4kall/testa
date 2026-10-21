import ora from 'ora';
import { buildProject } from '../services/buildService.js';
import { logger } from '../utils/logger.js';
import { handleError } from '../utils/errorHandler.js';

export function registerBuildCommand(program) {
  program
    .command('build')
    .description('сборка проекта')
    .option('-c, --config <path>', 'путь к файлу конфигурации', 'config.json')
    .option('--dry-run', 'режим проверки без изменения файлов')
    .action(async (options) => {
      try {
        const spinner = ora({
          text: 'Сборка проекта...',
          stream: process.stderr
        }).start();

        const result = await buildProject(options);
        spinner.stop();

        logger.success(`Сборка завершена за ${result.time}`);
        logger.log(`Результат: ${result.output}`);
        process.exit(0);
      } catch (err) {
        handleError(err);
      }
    });
}
