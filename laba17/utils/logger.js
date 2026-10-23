import chalk from 'chalk';

export const logger = {
  success(message) {
    console.log(chalk.green(`✔ ${message}`));
  },
  error(message) {
    console.error(chalk.red(`✖ ${message}`));
  },
  warn(message) {
    console.warn(chalk.yellow(`⚠ ${message}`));
  },
  info(message) {
    console.log(chalk.blue(message));
  },
  log(message) {
    console.log(message);
  }
};
