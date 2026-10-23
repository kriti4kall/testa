import fs from 'fs';
import path from 'path';
import { readConfig } from './configService.js';

export async function buildProject(options = {}) {
  const config = readConfig(options.config || 'config.json');

  if (options.dryRun) {
    return {
      dryRun: true,
      time: '0.1s',
      output: 'dist/my-app.js'
    };
  }

  const distDir = path.resolve('dist');
  if (!fs.existsSync(distDir)) {
    fs.mkdirSync(distDir, { recursive: true });
  }

  const targetFile = path.join(distDir, 'my-app.js');
  fs.writeFileSync(targetFile, '// Built artifact for lab17\nconsole.log("my-app running");\n');

  return {
    dryRun: false,
    time: '2.3s',
    output: 'dist/my-app.js'
  };
}
