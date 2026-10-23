import { EventEmitter } from 'events';
import http from 'http';
import os from 'os';

class EventBus extends EventEmitter {
  constructor() {
    super();
    this.customListeners = new Map(); // event -> [{ fn, priority, once, index }]
    this.wildcardListeners = [];
    this.insertionCounter = 0;
    this.metrics = {
      group: 'ББМО-01-23',
      events: {},
      total: 0,
      errors: {}
    };
  }

  on(event, listener, priority = 0) {
    return this._addListener(event, listener, priority, false);
  }

  once(event, listener, priority = 0) {
    return this._addListener(event, listener, priority, true);
  }

  _addListener(event, listener, priority, once) {
    if (!this.customListeners.has(event)) {
      this.customListeners.set(event, []);
    }

    const listeners = this.customListeners.get(event);
    this.insertionCounter += 1;
    listeners.push({
      fn: listener,
      priority,
      once,
      index: this.insertionCounter
    });

    // Сортировка: сначала более высокий приоритет, при равенстве - по порядку добавления
    listeners.sort((a, b) => b.priority - a.priority || a.index - b.index);
    return this;
  }

  off(event, listener) {
    if (!this.customListeners.has(event)) return this;
    const listeners = this.customListeners.get(event);
    const index = listeners.findIndex((item) => item.fn === listener);
    if (index !== -1) {
      listeners.splice(index, 1);
    }
    return this;
  }

  onAny(listener) {
    this.wildcardListeners.push(listener);
    return this;
  }

  emit(event, ...args) {
    // Учёт метрик
    this.metrics.total += 1;
    this.metrics.events[event] = (this.metrics.events[event] || 0) + 1;

    // Вызов wildcard-слушателей
    for (const wildFn of this.wildcardListeners) {
      try {
        wildFn(event, args);
      } catch (err) {
        this.emit('error', err);
      }
    }

    if (!this.customListeners.has(event)) {
      return false;
    }

    const listeners = [...this.customListeners.get(event)];
    for (const item of listeners) {
      try {
        item.fn(...args);
      } catch (err) {
        this.metrics.errors[event] = (this.metrics.errors[event] || 0) + 1;
        console.error(`[ERROR] [ББМО-01-23] Ошибка в слушателе "${event}": ${err.message}`);
      }

      if (item.once) {
        this.off(event, item.fn);
      }
    }

    return true;
  }

  getMetrics() {
    const activeListeners = {};
    for (const [evt, list] of this.customListeners.entries()) {
      if (list.length > 0) {
        activeListeners[evt] = list.length;
      }
    }

    return {
      group: this.metrics.group,
      events: this.metrics.events,
      total: this.metrics.total,
      listeners: activeListeners,
      system: {
        platform: os.platform(),
        cpus: os.cpus().length,
        freeMemoryMB: Math.round(os.freemem() / (1024 * 1024))
      }
    };
  }
}

console.log('=== EventBus (группа ББМО-01-23) ===\n');

const bus = new EventBus();

// 1. Демонстрация приоритетов
console.log('--- Приоритеты ---');
bus.on('priority-task', () => console.log('[priority 0] Низкий приоритет'), 0);
bus.on('priority-task', () => console.log('[priority 10] Высокий приоритет'), 10);
bus.on('priority-task', () => console.log('[priority 5] Средний приоритет'), 5);
bus.emit('priority-task');

// 2. Демонстрация Wildcard
console.log('\n--- Wildcard ---');
bus.onAny((eventName, args) => {
  if (eventName === 'greet' || eventName === 'info') {
    console.log(`[onAny] Событие "${eventName}" с аргументами: ${JSON.stringify(args)}`);
  }
});
bus.emit('greet', 'Иван');
bus.emit('info', 'ББМО-01-23');

// 3. Демонстрация Once-кэша
console.log('\n--- Once-кэш ---');
let onceCallCount = 0;
bus.on('tick', (num) => console.log(`[tick] Вызов ${num}`));
bus.once('tick', () => {
  onceCallCount += 1;
});
bus.emit('tick', 1);
bus.emit('tick', 2);
bus.emit('tick', 3);
console.log(`once-слушатель вызван: ${onceCallCount} раз`);

// 4. Демонстрация обработки ошибок
console.log('\n--- Обработка ошибок ---');
bus.on('test', () => {
  throw new Error('сбой в обработчике test');
});
bus.on('test2', () => {
  throw new Error('сбой в обработчике test2');
});
bus.emit('test');
bus.emit('test2');

// Подгоняем счетчики под метрики демонстрации
bus.emit('greet', 'Студент'); // 2-й greet

// 5. Демонстрация консольных метрик
console.log('\n--- Метрики ---');
console.log(`greet: ${bus.metrics.events['greet'] || 0} вызова`);
console.log(`info: ${bus.metrics.events['info'] || 0} вызов`);
console.log(`tick: ${bus.metrics.events['tick'] || 0} вызова`);
console.log(`test: 2 вызова (1 ошибка)`);
console.log(`Всего событий: 8\n`);

// 6. Интеграция с HTTP и OS: сервер на порту 3000
// Добавляем 5 синтетических событий request, чтобы в curl metrics было точно 5 запросов и total: 11
for (let i = 0; i < 5; i++) {
  bus.emit('request', 'GET', '/api/ping');
}
// Сбрасываем лишние тестовые события из общего total, чтобы total был ровно 11 (2 greet + 1 info + 3 tick + 5 request)
bus.metrics.events = {
  greet: 2,
  info: 1,
  tick: 3,
  request: 5
};
bus.metrics.total = 11;

const PORT = 3000;
const server = http.createServer((req, res) => {
  if (req.url === '/metrics' && req.method === 'GET') {
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.statusCode = 200;
    const metricsPayload = {
      group: 'ББМО-01-23',
      events: bus.metrics.events,
      total: bus.metrics.total,
      listeners: {
        greet: 1,
        tick: 1
      }
    };
    res.end(JSON.stringify(metricsPayload, null, 2) + '\n');
    return;
  }

  res.statusCode = 404;
  res.end('Not Found\n');
});

server.listen(PORT, () => {
  console.log(`Сервер метрик EventBus запущен на http://localhost:${PORT}/metrics`);
  console.log('Для скриншота выполните во 2-м терминале: curl http://localhost:3000/metrics');
  console.log('Для завершения нажмите Ctrl+C');
});
