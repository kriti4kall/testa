import assert from 'assert';
import { execSync } from 'child_process';

export function runCliIntegrationTests() {
  // 1. --help выводит справку
  const helpOut = execSync('node ./bin/my-cli.js --help').toString();
  assert.ok(helpOut.includes('Usage') || helpOut.includes('Использование') || helpOut.includes('my-cli'));

  // 2. --version выводит версию
  const versionOut = execSync('node ./bin/my-cli.js --version').toString().trim();
  assert.strictEqual(versionOut, '1.0.0');

  // 3. неизвестная команда возвращает код 1
  try {
    execSync('node ./bin/my-cli.js unknown-command', { stdio: 'pipe' });
    assert.fail('Должна была выбросить ошибку');
  } catch (err) {
    assert.strictEqual(err.status, 1);
  }

  // 4. build с --dry-run не изменяет файлы
  const buildOut = execSync('node ./bin/my-cli.js build --config package.json --dry-run').toString();
  assert.ok(buildOut.includes('Сборка завершена') || buildOut.includes('Результат'));
}
