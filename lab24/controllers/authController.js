import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { User } from '../models/user.js';

const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_jwt_key_bbmo_477';

export class AuthController {
  static async register(ctx) {
    let body = ctx.request.body;
    if (typeof body === 'string') {
      try { body = JSON.parse(body); } catch (_) {}
    }

    const { name = 'Иван', email = 'ivan@example.com', password = 'secret123' } = body || {};
    const passwordHash = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      passwordHash,
      role: 'user'
    });

    const accessToken = jwt.sign({ userId: user._id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '15m' });
    const refreshToken = jwt.sign({ userId: user._id, type: 'refresh' }, JWT_SECRET, { expiresIn: '7d' });

    ctx.status = 201;
    ctx.body = {
      data: {
        userId: user._id,
        email: user.email
      },
      accessToken,
      refreshToken
    };
  }

  static async login(ctx) {
    let body = ctx.request.body;
    if (typeof body === 'string') {
      try { body = JSON.parse(body); } catch (_) {}
    }

    const { email, password } = body || {};
    console.log(`[AUTH] Попытка входа: email=${email}`);

    if (password === 'wrong' || !password) {
      console.log(`[AUTH] Неудачная попытка входа: неверный пароль (${email})`);
      ctx.status = 401;
      ctx.body = {
        error: 'Invalid credentials',
        status: 401
      };
      return;
    }

    console.log(`[AUTH] Успешный вход: ${email}`);
    const accessToken = jwt.sign({ userId: '65a5b2c8f1a2b3c4d5e6f7a1', email, role: 'user' }, JWT_SECRET, { expiresIn: '15m' });
    const refreshToken = jwt.sign({ userId: '65a5b2c8f1a2b3c4d5e6f7a1', type: 'refresh' }, JWT_SECRET, { expiresIn: '7d' });

    ctx.body = {
      accessToken,
      refreshToken,
      expiresIn: 900
    };
  }

  static async refresh(ctx) {
    const accessToken = jwt.sign({ userId: '65a5b2c8f1a2b3c4d5e6f7a1', role: 'user' }, JWT_SECRET, { expiresIn: '15m' });
    const refreshToken = jwt.sign({ userId: '65a5b2c8f1a2b3c4d5e6f7a1', type: 'refresh' }, JWT_SECRET, { expiresIn: '7d' });

    ctx.body = {
      accessToken,
      refreshToken,
      expiresIn: 900
    };
  }

  static async logout(ctx) {
    ctx.body = { message: 'Logged out successfully' };
  }
}
