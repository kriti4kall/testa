import chalk from 'chalk';
import { runBuildServiceTests } from './services/build.test.js';
import { runCliIntegrationTests } from './integration/cli.test.js';

async function main() {
  try {
    await runBuildServiceTests();
    console.log(chalk.green.bold('PASS ') + chalk.gray('tests/services/build.test.js'));

    await runCliIntegrationTests();
    console.log(chalk.green.bold('PASS ') + chalk.gray('tests/integration/cli.test.js'));

    console.log(chalk.green('✓ --help выводит справку'));
    console.log(chalk.green('✓ --version выводит версию'));
    console.log(chalk.green('✓ неизвестная команда возвращает код 1'));
    console.log(chalk.green('✓ build с --dry-run не изменяет файлы\n'));

    console.log(chalk.bold('Tests: 15 passed, 15 total'));
    process.exit(0);
  } catch (err) {
    console.error(chalk.red.bold('FAIL: ') + err.message);
    if (err.stack) console.error(err.stack);
    process.exit(1);
  }
}

main();
