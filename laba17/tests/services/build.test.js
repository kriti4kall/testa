import assert from 'assert';
import { buildProject } from '../../services/buildService.js';
import { readConfig } from '../../services/configService.js';

export async function runBuildServiceTests() {
  const tests = [
    {
      name: 'readConfig выбрасывает ошибку при отсутствии файла',
      fn: () => {
        assert.throws(() => readConfig('non-existent.json'));
      }
    },
    {
      name: 'buildProject поддерживает режим --dry-run',
      async fn() {
        // Создаем временный конфиг для теста
        const result = await buildProject({ config: 'package.json', dryRun: true });
        assert.strictEqual(result.dryRun, true);
      }
    },
    {
      name: 'buildProject возвращает путь к результату',
      async fn() {
        const result = await buildProject({ config: 'package.json', dryRun: true });
        assert.ok(result.output.includes('my-app.js'));
      }
    }
  ];

  for (const t of tests) {
    await t.fn();
  }
}
