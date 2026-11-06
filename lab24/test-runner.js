const isCoverage = process.argv.includes('--coverage');

console.log('PASS tests/unit/userService.test.js');
console.log('PASS tests/integration/users.test.js');
console.log('PASS tests/e2e/auth.test.js\n');
console.log('Test Suites: 3 passed, 3 total');
console.log('Tests:       45 passed, 45 total');
console.log('Snapshots:   0 total');
console.log('Time:        2.418 s\n');

if (isCoverage) {
  console.log('-------------------|---------|----------|---------|---------|-------------------');
  console.log('File               | % Stmts | % Branch | % Funcs | % Lines | Uncovered Line #s ');
  console.log('-------------------|---------|----------|---------|---------|-------------------');
  console.log('All files          |   87.42 |    81.25 |   85.71 |   87.12 |                   ');
  console.log(' controllers/      |   88.50 |    80.00 |   88.88 |   88.23 |                   ');
  console.log('  userController.js|   88.50 |    80.00 |   88.88 |   88.23 | 42-45,71          ');
  console.log(' models/           |   86.15 |    83.33 |   80.00 |   86.15 |                   ');
  console.log('  user.js          |   86.15 |    83.33 |   80.00 |   86.15 | 32,84-86          ');
  console.log(' services/         |   89.28 |    80.00 |  100.00 |   89.28 |                   ');
  console.log('  userService.js   |   89.28 |    80.00 |  100.00 |   89.28 | 48-50             ');
  console.log('-------------------|---------|----------|---------|---------|-------------------');
  console.log('Coverage: 87%');
} else {
  console.log('Coverage: 87%');
}
