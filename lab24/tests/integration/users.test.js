import { describe, it, expect } from '@jest/globals';
import { UserService } from '../../services/userService.js';

describe('Users API Integration Tests', () => {
  it('should retrieve list of users with pagination', async () => {
    const result = await UserService.getUsers({ page: 1, limit: 5 });
    expect(result.data).toBeDefined();
    expect(Array.isArray(result.data)).toBe(true);
    expect(result.pagination.limit).toBe(5);
  });

  it('should search user by name or email', async () => {
    const result = await UserService.getUsers({ search: 'Иван' });
    expect(result.data.length).toBeGreaterThan(0);
    expect(result.data[0].name).toContain('Иван');
  });

  it('should return system statistics for users', async () => {
    const stats = await UserService.getUserStats();
    expect(stats.totalUsers).toBeGreaterThan(0);
    expect(stats.group).toBe('ББМО-477');
  });
});
