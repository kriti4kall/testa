

import os from 'os';

const cpus = os.cpus();
const totalCpuCount = cpus.length;
const cpuModel = cpus[0]?.model || 'Неизвестно';
const avgSpeed = Math.round(cpus.reduce((sum, cpu) => sum + cpu.speed, 0) / (totalCpuCount || 1));

console.log('=== Информация о процессоре ===');
console.log(`Количество логических ядер: ${totalCpuCount}`);
console.log(`Модель процессора:          ${cpuModel}`);
console.log(`Средняя частота:            ${avgSpeed} МГц\n`);

const totalMemBytes = os.totalmem();
const isSimulateLow = process.argv.includes('--low-mem-test');
// При тестировании эмулируем малый объём свободной памяти (<20%) для скриншота в отчёт
const freeMemBytes = isSimulateLow ? totalMemBytes * 0.12 : os.freemem();
const usedMemBytes = totalMemBytes - freeMemBytes;

const totalMemGb = (totalMemBytes / (1024 ** 3)).toFixed(2);
const freeMemGb = (freeMemBytes / (1024 ** 3)).toFixed(2);
const usedMemGb = (usedMemBytes / (1024 ** 3)).toFixed(2);
const usedPercent = ((usedMemBytes / totalMemBytes) * 100).toFixed(1);
const freePercent = ((freeMemBytes / totalMemBytes) * 100).toFixed(1);

console.log('=== Информация о памяти ===');
console.log(`Общий объём:  ${totalMemGb} ГБ`);
console.log(`Свободно:     ${freeMemGb} ГБ (${freePercent}%)`);
console.log(`Использовано: ${usedMemGb} ГБ (${usedPercent}%)\n`);

console.log('=== Средняя загрузка системы ===');
if (os.platform() === 'win32') {
  console.log('1 мин: недоступно, 5 мин: недоступно, 15 мин: недоступно (Windows не поддерживает loadavg)\n');
} else {
  const [l1, l5, l15] = os.loadavg();
  console.log(`1 мин: ${l1.toFixed(2)}, 5 мин: ${l5.toFixed(2)}, 15 мин: ${l15.toFixed(2)}\n`);
}

console.log('Группа: ББМО-01-23');
if (freePercent < 20) {
  console.log('Внимание: мало свободной памяти (< 20%)!');
} else {
  console.log('Память в норме');
}
