import test, { suite } from 'node:test';
import assert from 'node:assert';
import jwt from 'jsonwebtoken';
import { requireAuth, requireRole } from '../../../api/middleware/auth.middleware.js';
import { AuthenticationError } from '../../../domain/errors/index.js';
import { config } from '../../../config/index.js';
import { UserRole } from 'shared';

suite('Auth Middleware', () => {
  test('requireAuth should throw if no authorization header', (t) => {
    const req = { headers: {} } as any;
    const res = {} as any;
    let nextCalledWith: any;
    const next = (err?: any) => { nextCalledWith = err; };

    requireAuth(req, res, next);
    
    assert.ok(nextCalledWith instanceof AuthenticationError);
    assert.strictEqual(nextCalledWith.code, 'AUTH_REQUIRED');
  });

  test('requireAuth should throw if format is invalid', (t) => {
    const req = { headers: { authorization: 'Basic token' } } as any;
    const res = {} as any;
    let nextCalledWith: any;
    const next = (err?: any) => { nextCalledWith = err; };

    requireAuth(req, res, next);
    
    assert.ok(nextCalledWith instanceof AuthenticationError);
    assert.strictEqual(nextCalledWith.code, 'AUTH_INVALID_TOKEN');
  });

  test('requireAuth should populate req.user on valid token', (t) => {
    const payload = { id: 'user-1', role: UserRole.ANALYST };
    const token = jwt.sign(payload, config.jwt.secret);
    const req = { headers: { authorization: `Bearer ${token}` } } as any;
    const res = {} as any;
    let nextCalled = false;
    const next = () => { nextCalled = true; };

    requireAuth(req, res, next);
    
    assert.strictEqual(nextCalled, true);
    assert.strictEqual(req.user.id, 'user-1');
    assert.strictEqual(req.user.role, UserRole.ANALYST);
  });

  test('requireRole should return 403 if role not allowed', (t) => {
    const req = { user: { role: UserRole.ANALYST } } as any;
    let status: number = 0;
    let json: any = null;
    const res = {
      status: (s: number) => { status = s; return res; },
      json: (j: any) => { json = j; }
    } as any;
    const next = () => {};

    const middleware = requireRole([UserRole.DECISION_MAKER]);
    middleware(req, res, next);

    assert.strictEqual(status, 403);
    assert.strictEqual(json.success, false);
    assert.strictEqual(json.error.code, 'FORBIDDEN');
  });

  test('requireRole should call next if role is allowed', (t) => {
    const req = { user: { role: UserRole.DECISION_MAKER } } as any;
    const res = {} as any;
    let nextCalled = false;
    const next = () => { nextCalled = true; };

    const middleware = requireRole([UserRole.DECISION_MAKER]);
    middleware(req, res, next);

    assert.strictEqual(nextCalled, true);
  });
});
