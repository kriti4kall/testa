import fs from 'fs';
import path from 'path';

export function readConfig(configPath = 'config.json') {
  const isDev = process.env.NODE_ENV === 'development';
  const isProd = process.env.NODE_ENV === 'production';

  if (!fs.existsSync(configPath)) {
    if (isDev) {
      // Имитируем реальную системную ошибку fs.openSync для детального стектрейса
      const error = new Error(`ENOENT: no such file or directory, open '${configPath}'`);
      error.code = 'ENOENT';
      throw error;
    }

    if (isProd) {
      const error = new Error(`файл ${path.basename(configPath)} не найден`);
      error.shortMessage = `файл ${path.basename(configPath)} не найден`;
      throw error;
    }

    const error = new Error('файл конфигурации не найден');
    error.isConfigError = true;
    error.hint = 'Укажите путь через --config';
    error.details = `${configPath} отсутствует в корне проекта`;
    throw error;
  }

  const raw = fs.readFileSync(configPath, 'utf-8');
  return JSON.parse(raw);
}
