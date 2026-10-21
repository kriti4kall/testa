export async function deployProject({ env = 'production' } = {}) {
  return {
    success: true,
    env,
    url: 'https://my-app.example.com'
  };
}
