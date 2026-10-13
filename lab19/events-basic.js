
import { EventEmitter } from 'events';

const emitter = new EventEmitter();
let silent = false;

emitter.on('greet', (name) => {
  if (!silent) console.log(`[greet] Привет, ${name}!`);
});

emitter.on('info', () => {
  if (!silent) console.log('[info] Группа: ББМО-01-23');
});

emitter.on('bye', () => {
  if (!silent) console.log('[bye] До свидания!');
});

console.log('=== Демонстрация EventEmitter ===');
emitter.emit('greet', 'Ян');
emitter.emit('info');
emitter.emit('bye');
console.log();

const hasUnknown = emitter.emit('unknown');
console.log(`Событие "unknown" без слушателей: ${hasUnknown}`);

silent = true;
const hasGreet = emitter.emit('greet', 'Иван');
console.log(`Событие "greet" со слушателями: ${hasGreet}`);
