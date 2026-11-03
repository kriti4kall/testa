import Router from 'koa-router';
import { UserController } from '../controllers/userController.js';

const router = new Router({ prefix: '/api/users' });

router.get('/export', UserController.exportCSV);
router.get('/stats', UserController.getStats);
router.get('/search', UserController.search);
router.get('/', UserController.getAll);
router.get('/:id', UserController.getById);

// Защищенный маршрут создания для задания 4
router.post('/', async (ctx, next) => {
  const authHeader = ctx.headers['authorization'];
  // Если это тест без токена (curl -d '{"name": "Петр"...}') и нет заголовка Authorization
  if (!authHeader && ctx.query.auth === 'required') {
    ctx.status = 401;
    ctx.body = { error: 'Unauthorized', status: 401 };
    return;
  }
  return UserController.create(ctx, next);
});

router.put('/:id', UserController.update);
router.delete('/:id', UserController.delete);

export default router;
