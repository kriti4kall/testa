

import os from 'os';

function maskMac(mac) {
  if (!mac || mac === '00:00:00:00:00:00') {
    return '00:00:00:**:**:**';
  }
  const parts = mac.split(':');
  if (parts.length === 6) {
    return `${parts[0]}:${parts[1]}:${parts[2]}:**:**:**`;
  }
  return mac;
}

const interfaces = os.networkInterfaces();
const interfaceNames = Object.keys(interfaces);

let primaryInterface = null;

console.log('=== Сетевые интерфейсы ===');

for (const name of interfaceNames) {
  const details = interfaces[name] || [];
  const ipv4Info = details.find((d) => d.family === 'IPv4') || details[0];

  if (ipv4Info) {
    console.log(`Интерфейс:   ${name}`);
    console.log(`IPv4:        ${ipv4Info.address}`);
    console.log(`MAC:         ${maskMac(ipv4Info.mac)}`);
    console.log(`Внутренний:  ${ipv4Info.internal ? 'да' : 'нет'}\n`);

    if (!primaryInterface && !ipv4Info.internal && ipv4Info.family === 'IPv4') {
      primaryInterface = `${name} (${ipv4Info.address})`;
    }
  }
}

console.log(`Всего интерфейсов:   ${interfaceNames.length}`);
console.log(`Основной интерфейс:  ${primaryInterface || 'Не определён'}\n`);

const userInfo = os.userInfo();
const isRoot = userInfo.uid === 0 || userInfo.username === 'root';

console.log('=== Информация о пользователе ===');
console.log(`Имя пользователя:    ${userInfo.username}`);
console.log(`UID:                 ${userInfo.uid}`);
console.log(`Домашняя директория: ${userInfo.homedir}\n`);

console.log('Группа: ББМО-01-23');
console.log(`Проверка root:       ${isRoot ? 'да' : 'нет'}`);
