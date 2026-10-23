import chalk from 'chalk';

export function setupErrorHandling() {
  process.on('uncaughtException', (err) => {
    handleError(err);
  });

  process.on('unhandledRejection', (reason) => {
    handleError(reason);
  });
}

export function handleError(err) {
  const isDev = process.env.NODE_ENV === 'development';
  const isProd = process.env.NODE_ENV === 'production';

  if (err.isConfigError) {
    console.error(chalk.red(`✖ Ошибка: ${err.message}`));
    if (err.hint) {
      console.error(err.hint);
    }
    if (err.details) {
      console.error(`Подробности: ${err.details}\n`);
    }
    process.exit(1);
  }

  if (isDev) {
    console.error(chalk.red(`✖ Ошибка: ${err.message}`));
    if (err.stack) {
      console.error(err.stack);
    }
    process.exit(1);
  }

  if (isProd) {
    const message = err.shortMessage || (err.message.includes('ENOENT') ? 'файл config.json не найден' : err.message);
    console.error(chalk.red(`✖ Ошибка: ${message}`));
    process.exit(1);
  }

  console.error(chalk.red(`✖ Ошибка: ${err.message}`));
  if (err.hint) {
    console.error(err.hint);
  }
  process.exit(1);
}
