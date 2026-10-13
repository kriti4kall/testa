

import { EventEmitter } from 'events';

const emitter = new EventEmitter();

// 1. Сравнение on и once
console.log('=== Сравнение on и once ===');

let onCount = 0;
let onceCount = 0;
let tickIndex = 0;

emitter.on('tick', () => {
  onCount++;
  console.log(`[tick #${tickIndex}] on-слушатель`);
});

emitter.once('tick', () => {
  onceCount++;
  console.log(`[tick #${tickIndex}] once-слушатель`);
});

tickIndex = 1;
emitter.emit('tick');

tickIndex = 2;
emitter.emit('tick');

tickIndex = 3;
emitter.emit('tick');

console.log();
console.log(`on-слушатель вызван: ${onCount} раза`);
console.log(`once-слушатель вызван: ${onceCount} раз\n`);

// 2. Управление подписками
console.log('=== Управление подписками ===');

const listenerA = () => {};
const listenerB = () => {};
const listenerC = () => {};

emitter.on('custom', listenerA);
emitter.on('custom', listenerB);
emitter.on('custom', listenerC);

console.log(`Слушателей до удаления: ${emitter.listenerCount('custom')}`);

emitter.removeListener('custom', listenerA);
console.log(`Слушателей после удаления одного: ${emitter.listenerCount('custom')}`);

emitter.removeAllListeners('custom');
console.log(`Слушателей после removeAllListeners: ${emitter.listenerCount('custom')}\n`);

// 3. Порядок вызова слушателей
console.log('=== Порядок вызова ===');

emitter.on('order', () => console.log('1. Первый слушатель (группа ББМО-01-23)'));
emitter.on('order', () => console.log('2. Второй слушатель'));
emitter.on('order', () => console.log('3. Третий слушатель'));

emitter.emit('order');
