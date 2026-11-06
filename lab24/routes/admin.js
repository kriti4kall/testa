import Router from 'koa-router';

const router = new Router({ prefix: '/api/admin' });

router.get('/users', async (ctx) => {
  const auth = ctx.headers['authorization'];
  if (!auth) {
    ctx.status = 401;
    ctx.body = { error: 'Unauthorized', status: 401 };
    return;
  }

  // Если токен обычного пользователя без роли admin
  if (auth.includes('user-token') || !auth.includes('admin')) {
    ctx.status = 403;
    ctx.body = {
      error: 'Forbidden: admin role required',
      status: 403
    };
    return;
  }

  ctx.body = {
    message: 'Welcome, Admin!',
    usersCount: 100
  };
});

export default router;
