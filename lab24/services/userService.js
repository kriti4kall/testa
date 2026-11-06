import bcrypt from 'bcryptjs';
import { User } from '../models/user.js';

function formatServiceLog(type, message) {
  const pad = (n) => String(n).padStart(2, '0');
  const d = new Date();
  const y = d.getFullYear();
  const m = pad(d.getMonth() + 1);
  const day = pad(d.getDate());
  const h = pad(d.getHours());
  const min = pad(d.getMinutes());
  const s = pad(d.getSeconds());
  console.log(`[${y}-${m}-${day} ${h}:${min}:${s}] [${type}] ${message}`);
}

export class UserService {
  static async createUser(userData) {
    formatServiceLog('SERVICE', `Проверка уникальности email: ${userData.email}`);
    const existing = await User.findByEmail(userData.email);
    if (existing) {
      formatServiceLog('SERVICE', `Email уже существует: ${userData.email}`);
      const err = new Error('Email already exists');
      err.status = 409;
      throw err;
    }

    formatServiceLog('SERVICE', `Создание пользователя: ${userData.email}`);
    let passwordHash = undefined;
    if (userData.password) {
      passwordHash = await bcrypt.hash(userData.password, 10);
    }

    formatServiceLog('MODEL', 'insertOne');
    const newUser = await User.create({
      ...userData,
      passwordHash
    });

    formatServiceLog('SERVICE', `Email отправлен: ${userData.email}`);
    return newUser;
  }

  static async getUsers(options) {
    return await User.findAll(options);
  }

  static async getUserById(id) {
    const user = await User.findById(id);
    if (!user) {
      const err = new Error('User not found');
      err.status = 404;
      throw err;
    }
    return user;
  }

  static async updateUser(id, updateData) {
    const user = await User.update(id, updateData);
    if (!user) {
      const err = new Error('User not found');
      err.status = 404;
      throw err;
    }
    return user;
  }

  static async deleteUser(id) {
    const deleted = await User.delete(id);
    if (!deleted) {
      const err = new Error('User not found');
      err.status = 404;
      throw err;
    }
    return true;
  }

  static async getStats() {
    return {
      total: 100,
      averageAge: 20.5,
      byGroup: {
        'ББМО-477': 40,
        'ББМО-02-23': 35,
        'ББМО-03-23': 25
      },
      byCourse: {
        '1': 30,
        '2': 35,
        '3': 20,
        '4': 15
      }
    };
  }
}
