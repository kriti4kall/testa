export async function initProject({ name, type }) {
  if (!name) {
    throw new Error('Имя проекта обязательно');
  }

  return {
    name,
    type: type || 'cli',
    group: 'ББМО-01-23',
    dependenciesInstalled: true,
    gitInitialized: true
  };
}
