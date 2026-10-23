import { Command } from 'commander';
import { initProject } from '../services/projectService.js';
import { logger } from '../utils/logger.js';

export function registerInitCommand(program) {
  program
    .command('init')
    .description('инициализация проекта')
    .option('-n, --name <name>', 'название проекта')
    .option('-t, --type <type>', 'тип проекта', 'cli')
    .action(async (options) => {
      const name = options.name || 'test';
      const result = await initProject({ name, type: options.type });

      logger.success(`Проект "${result.name}" создан`);
      if (result.dependenciesInstalled) {
        logger.success('Установлены зависимости');
      }
      if (result.gitInitialized) {
        logger.success('Инициализирован Git-репозиторий');
      }
      logger.log('Проект готов к работе!');
      process.exit(0);
    });
}
