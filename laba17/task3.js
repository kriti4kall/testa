
import { Command } from 'commander';
import inquirer from 'inquirer';

const program = new Command();

async function readStdin() {
  if (process.stdin.isTTY) {
    return '';
  }
  return new Promise((resolve) => {
    let data = '';
    process.stdin.setEncoding('utf-8');
    process.stdin.on('data', (chunk) => {
      data += chunk;
    });
    process.stdin.on('end', () => {
      resolve(data.trim());
    });
    setTimeout(() => {
      resolve(data.trim());
    }, 200);
  });
}

const typeMapping = {
  cli: 'CLI-утилита',
  web: 'Web-приложение',
  lib: 'Библиотека',
  microservice: 'Микросервис',
  'CLI-утилита': 'CLI-утилита',
  'Web-приложение': 'Web-приложение',
  'Библиотека': 'Библиотека',
  'Микросервис': 'Микросервис'
};

program
  .name('my-cli')
  .description('CLI-приложение для лабораторной работы №17');

program
  .command('init')
  .description('инициализировать новый проект')
  .option('-n, --name <name>', 'название проекта')
  .option('-t, --type <type>', 'тип проекта (web, cli, lib, microservice)')
  .option('--typescript', 'добавить TypeScript')
  .option('--eslint', 'добавить ESLint')
  .option('--prettier', 'добавить Prettier')
  .option('--jest', 'добавить Jest')
  .option('--git', 'инициализировать Git-репозиторий')
  .option('--token <token>', 'токен доступа')
  .option('--no-interactive', 'отключить интерактивный режим (для CI/CD)')
  .action(async (options) => {
    const stdinData = await readStdin();
    const isPiped = !process.stdin.isTTY;
    const isInteractive = options.interactive !== false && !isPiped;

    let projectName = options.name || (stdinData ? stdinData.split('\n')[0].trim() : '');
    let projectType = options.type;
    let selectedOptions = [];
    let useGit = options.git;

    if (options.typescript) selectedOptions.push('TypeScript');
    if (options.eslint) selectedOptions.push('ESLint');
    if (options.prettier) selectedOptions.push('Prettier');
    if (options.jest) selectedOptions.push('Jest');

    if (!isInteractive) {
      if (isPiped && projectName && !projectType) {
        console.error('Ошибка: недостаточно данных. Укажите --type');
        process.exit(1);
      }

      if (!projectName || !projectType) {
        console.error('Ошибка: в неинтерактивном режиме необходимо указать --name и --type');
        process.exit(1);
      }

      const displayType = typeMapping[projectType.toLowerCase()] || projectType;
      const optionsText = selectedOptions.length > 0 ? selectedOptions.join(', ') : 'нет';

      console.log(`✓ Проект "${projectName}" успешно инициализирован!`);
      console.log(`Тип: ${displayType}`);
      console.log(`Опции: ${optionsText}`);
      console.log(`Git: ${useGit ? 'да' : 'нет'}`);
      process.exit(0);
    }

    const answers = await inquirer.prompt([
      {
        type: 'input',
        name: 'name',
        message: 'Введите название проекта:',
        default: projectName || 'my-project',
        when: !projectName
      },
      {
        type: 'list',
        name: 'type',
        message: 'Выберите тип проекта:',
        choices: ['Web-приложение', 'CLI-утилита', 'Библиотека', 'Микросервис'],
        default: 'CLI-утилита',
        when: !projectType
      },
      {
        type: 'checkbox',
        name: 'options',
        message: 'Выберите дополнительные опции: (Press <space> to select)',
        choices: [
          { name: 'TypeScript', checked: true },
          { name: 'ESLint', checked: false },
          { name: 'Prettier', checked: true },
          { name: 'Jest', checked: false }
        ],
        when: selectedOptions.length === 0
      },
      {
        type: 'confirm',
        name: 'git',
        message: 'Использовать Git?',
        default: true,
        when: useGit === undefined
      },
      {
        type: 'password',
        name: 'token',
        message: 'Введите токен доступа:',
        mask: '*'
      }
    ]);

    const finalName = projectName || answers.name;
    const rawType = projectType || answers.type;
    const finalType = typeMapping[rawType] || rawType;
    const finalOptions = selectedOptions.length > 0 ? selectedOptions : (answers.options || []);
    const finalGit = useGit !== undefined ? useGit : answers.git;

    console.log(`✓ Проект "${finalName}" успешно инициализирован!`);
    console.log(`Тип: ${finalType}`);
    console.log(`Опции: ${finalOptions.join(', ')}`);
    console.log(`Git: ${finalGit ? 'да' : 'нет'}`);
    process.exit(0);
  });

program.parse(process.argv);
