#!/usr/bin/env node

import { Command } from 'commander';
import { setupErrorHandling } from '../utils/errorHandler.js';
import { registerInitCommand } from '../commands/init.js';
import { registerBuildCommand } from '../commands/build.js';
import { registerTestCommand } from '../commands/test.js';
import { registerDeployCommand } from '../commands/deploy.js';
import { registerProcessCommand } from '../commands/process.js';

setupErrorHandling();

const program = new Command();

program
  .name('my-cli')
  .description('Полноценное CLI-приложение (группа ББМО-01-23)')
  .version('1.0.0', '-V, --version', 'output the version number')
  .option('-v, --verbose', 'подробный вывод');

// Регистрация модульных подкоманд
registerInitCommand(program);
registerBuildCommand(program);
registerTestCommand(program);
registerDeployCommand(program);
registerProcessCommand(program);

// Базовые информационные команды
program
  .command('greet <name>')
  .description('поприветствовать пользователя')
  .action((name) => {
    console.log(`Привет, ${name}! Добро пожаловать в CLI-приложение группы ББМО-01-23.`);
    process.exit(0);
  });

program
  .command('info')
  .description('вывести информацию о группе')
  .action(() => {
    console.log('Группа: ББМО-01-23');
    console.log('Студент: Тискович Ян Юрьевич');
    console.log('Лабораторная работа: №17');
    console.log('Дата: 2024-01-15');
    process.exit(0);
  });

if (process.argv.length <= 2) {
  program.outputHelp();
  process.exit(0);
}

program.parse(process.argv);
