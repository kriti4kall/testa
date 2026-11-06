import { describe, it, expect } from '@jest/globals';
import { UserService } from '../../services/userService.js';

describe('UserService Unit Tests', () => {
  it('should create user with hashed password', async () => {
    const user = await UserService.createUser({
      name: 'Тестовый',
      email: 'test_unit@example.com',
      password: 'secretPassword123'
    });
    expect(user).toBeDefined();
    expect(user.email).toBe('test_unit@example.com');
  });

  it('should throw 409 if email already exists', async () => {
    await expect(UserService.createUser({
      name: 'Дубликат',
      email: 'ivan@example.com'
    })).rejects.toThrow('Email already exists');
  });
});
