import Router from 'koa-router';
import { AuthController } from '../controllers/authController.js';

const router = new Router({ prefix: '/api/auth' });

router.post('/register', AuthController.register);
router.post('/login', AuthController.login);
router.post('/refresh', AuthController.refresh);
router.post('/logout', AuthController.logout);

export default router;
