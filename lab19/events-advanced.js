import { EventEmitter } from 'events';

class PluginManager extends EventEmitter {
  constructor() {
    super();

    // Отслеживание добавления слушателей (newListener)
    this.on('newListener', (eventName) => {
      if (eventName === 'newListener' || eventName === 'removeListener') return;
      console.log(`[newListener] Добавлен слушатель "${eventName}"`);
    });

    // Отслеживание удаления слушателей (removeListener)
    this.on('removeListener', (eventName) => {
      if (eventName === 'newListener' || eventName === 'removeListener') return;
      console.log(`[removeListener] Удалён слушатель "${eventName}"`);
    });
  }

  registerPlugin(plugin) {
    console.log(`[PLUGIN] Зарегистрирован: ${plugin.name}`);
    plugin.init(this);
    this.emit('plugin:registered', plugin.name);
  }

  removePlugin(plugin) {
    plugin.destroy(this);
    console.log(`[PLUGIN] Удалён: ${plugin.name}`);
    this.emit('plugin:removed', plugin.name);
  }
}

console.log('=== Система плагинов ===');

const pluginManager = new PluginManager();

// Слушатели жизненного цикла плагинов
pluginManager.on('plugin:registered', () => {});
pluginManager.on('plugin:removed', () => {});

// Определение тестовых плагинов
const logHandler = (msg) => console.log(`LOG: ${msg}`);
const alertHandler = (msg) => console.log(`ALERT: ${msg}`);

const LoggerPlugin = {
  name: 'LoggerPlugin',
  init(manager) {
    manager.on('log', logHandler);
  },
  destroy(manager) {
    manager.removeListener('log', logHandler);
  }
};

const AlertPlugin = {
  name: 'AlertPlugin',
  init(manager) {
    manager.on('alert', alertHandler);
  },
  destroy(manager) {
    manager.removeListener('alert', alertHandler);
  }
};

pluginManager.registerPlugin(LoggerPlugin);
pluginManager.registerPlugin(AlertPlugin);

pluginManager.removePlugin(LoggerPlugin);

console.log('\n=== Демонстрация утечки ===');
const leakEmitter = new EventEmitter();
leakEmitter.setMaxListeners(2000);

for (let i = 0; i < 10; i++) {
  leakEmitter.on('test-leak', () => {});
}
console.log(`Слушателей до: ${leakEmitter.listenerCount('test-leak')}`);

for (let i = 0; i < 1000; i++) {
  leakEmitter.on('test-leak', () => {});
}
console.log(`Слушателей после добавления 1000: ${leakEmitter.listenerCount('test-leak')}`);

leakEmitter.removeAllListeners('test-leak');
console.log(`Слушателей после removeAllListeners: ${leakEmitter.listenerCount('test-leak')}`);

console.log('\n=== Асинхронные слушатели ===');
const asyncEmitter = new EventEmitter();

asyncEmitter.on('async-event', async () => {
  await new Promise((r) => setTimeout(r, 100));
  console.log('[BBMO-01-23] async-слушатель завершён через 100ms');
});

asyncEmitter.emit('async-event');
console.log('[BBMO-01-23] emit вызван (не ждёт async-слушатель)');
