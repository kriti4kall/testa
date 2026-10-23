

const args = process.argv.slice(2);
const command = args[0];

function printHelp() {
  console.log('Использование: my-cli <команда> [аргументы]');
  console.log('Доступные команды:');
  console.log('  greet <имя> - поприветствовать пользователя');
  console.log('  info        - вывести информацию о группе');
}

if (!command || command === '--help' || command === '-h') {
  printHelp();
  process.exit(0);
}

switch (command) {
  case 'greet': {
    const name = args[1];
    if (!name) {
      console.error('Ошибка: укажите имя пользователя.');
      console.log('Пример: my-cli greet "Иван"');
      process.exit(1);
    }
    console.log(`Привет, ${name}! Добро пожаловать в CLI-приложение группы ББМО-01-23.`);
    process.exit(0);
    break;
  }

  case 'info': {
    console.log('Группа: ББМО-01-23');
    console.log('Студент: [Ваше ФИО]');
    console.log('Лабораторная работа: №17');
    console.log('Дата: 2024-01-15');
    process.exit(0);
    break;
  }

  default: {
    console.error(`Ошибка: неизвестная команда "${command}"\n`);
    console.error('Для справки используйте: my-cli --help');
    process.exit(1);
  }
}
