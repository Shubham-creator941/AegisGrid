import test, { suite } from 'node:test';
import assert from 'node:assert';
import bcrypt from 'bcrypt';
import { AuthApplicationService } from '../../../application/services/auth/auth.service.js';
import { AuthenticationError } from '../../../domain/errors/index.js';
import { UserRole } from 'shared';

suite('AuthApplicationService', async () => {
  const mockUser = {
    id: 'user-1',
    name: 'Test Analyst',
    email: 'analyst@example.com',
    role: UserRole.ANALYST,
    is_active: true,
    password_hash: await bcrypt.hash('valid_password', 10),
    created_at: new Date(),
    updated_at: new Date()
  };

  const mockUserRepository = {
    findByEmail: async (email: string) => {
      if (email === mockUser.email) return mockUser;
      if (email === 'inactive@example.com') return { ...mockUser, is_active: false };
      if (email === 'nopass@example.com') return { ...mockUser, password_hash: undefined };
      return null;
    }
  } as any;

  const authService = new AuthApplicationService(mockUserRepository);

  test('Missing credentials should throw AuthenticationError', async () => {
    try {
      await authService.login({ email: '', password: '' });
      assert.fail('Should have thrown');
    } catch (err: any) {
      assert.ok(err instanceof AuthenticationError);
      assert.strictEqual(err.code, 'AUTH_INVALID_CREDENTIALS');
    }
  });

  test('Unknown user should throw AuthenticationError', async () => {
    try {
      await authService.login({ email: 'unknown@example.com', password: 'password' });
      assert.fail('Should have thrown');
    } catch (err: any) {
      assert.ok(err instanceof AuthenticationError);
      assert.strictEqual(err.code, 'AUTH_INVALID_CREDENTIALS');
    }
  });

  test('Invalid password should throw AuthenticationError', async () => {
    try {
      await authService.login({ email: 'analyst@example.com', password: 'wrong_password' });
      assert.fail('Should have thrown');
    } catch (err: any) {
      assert.ok(err instanceof AuthenticationError);
      assert.strictEqual(err.code, 'AUTH_INVALID_CREDENTIALS');
    }
  });

  test('Inactive user should throw AuthenticationError', async () => {
    try {
      await authService.login({ email: 'inactive@example.com', password: 'valid_password' });
      assert.fail('Should have thrown');
    } catch (err: any) {
      assert.ok(err instanceof AuthenticationError);
      assert.strictEqual(err.code, 'AUTH_USER_INACTIVE');
    }
  });

  test('Valid credentials should return JWT and user without password_hash', async () => {
    const response = await authService.login({ email: 'analyst@example.com', password: 'valid_password' });
    assert.strictEqual(response.success, true);
    assert.ok(response.data.access_token);
    assert.strictEqual(response.data.user.email, 'analyst@example.com');
    assert.strictEqual((response.data.user as any).password_hash, undefined);
  });
});
