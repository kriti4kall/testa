
import os from 'os';

function formatUptime(seconds) {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  return `${hours} ч ${minutes} мин ${secs} сек`;
}

function getPlatformDescription(platform) {
  switch (platform) {
    case 'win32':
      return 'Вы работаете в Windows';
    case 'linux':
      return 'Вы работаете в Linux';
    case 'darwin':
      return 'Вы работаете в macOS';
    default:
      return 'Неизвестная платформа';
  }
}

const platform = os.platform();

console.log('=== Информация о системе (группа ББМО-01-23) ===');
console.log(`Платформа:   ${platform}`);
console.log(`Тип ОС:      ${os.type()}`);
console.log(`Архитектура: ${os.arch()}`);
console.log(`Версия ОС:   ${os.release()}`);
console.log(`Имя хоста:   ${os.hostname()}`);
console.log(`Время работы: ${formatUptime(os.uptime())}\n`);

console.log(getPlatformDescription(platform));
