import ora from 'ora';
import inquirer from 'inquirer';
import { deployProject } from '../services/deployService.js';
import { logger } from '../utils/logger.js';

export function registerDeployCommand(program) {
  program
    .command('deploy')
    .description('развёртывание проекта')
    .option('-e, --env <env>', 'целевое окружение', 'production')
    .option('-f, --force', 'принудительное развёртывание без подтверждения')
    .action(async (options) => {
      const isProduction = options.env === 'production';

      if (isProduction && !options.force) {
        logger.warn('Вы собираетесь развернуть проект в production!');

        const answer = await inquirer.prompt([
          {
            type: 'confirm',
            name: 'confirmed',
            message: 'Продолжить?',
            default: false
          }
        ]);

        if (!answer.confirmed) {
          logger.warn('Развёртывание отменено пользователем');
          process.exit(0);
        }
      }

      const spinner = ora({
        text: 'Развёртывание...',
        stream: process.stderr
      }).start();

      const result = await deployProject(options);
      await new Promise((r) => setTimeout(r, 600));
      spinner.stop();

      logger.success('Развёрнуто успешно\n');
      logger.log(`URL: ${result.url}`);
      process.exit(0);
    });
}
