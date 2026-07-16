import jwt from 'jsonwebtoken';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { env } from '../../src/config/env';
import { User } from '../../src/infrastructure/database/models/user.model';
import { authenticate } from '../../src/shared/middlewares/auth.middleware';

const token = () =>
  jwt.sign(
    { userId: '64b000000000000000000001', role: 'user', type: 'access' },
    env.JWT_SECRET,
    { algorithm: 'HS256', issuer: 'imminiq-api', audience: 'imminiq-web' }
  );

const request = () => ({ headers: { authorization: `Bearer ${token()}` } }) as never;

describe('account status authentication enforcement', () => {
  afterEach(() => vi.restoreAllMocks());

  it('rejects an already-issued token immediately after suspension', async () => {
    vi.spyOn(User, 'findOne').mockReturnValue({
      select: () => ({
        lean: () =>
          Promise.resolve({
            status: 'paused',
            adminStatusReason: 'A temporary security review is required.',
          }),
      }),
    } as never);

    await expect(authenticate(request(), {} as never, vi.fn())).rejects.toMatchObject({
      statusCode: 403,
      code: 'ACCOUNT_PAUSED',
    });
  });

  it('allows an active account and attaches the verified identity', async () => {
    vi.spyOn(User, 'findOne').mockReturnValue({
      select: () => ({ lean: () => Promise.resolve({ status: 'active' }) }),
    } as never);
    const req = request() as { user?: { userId: string } };
    const next = vi.fn();

    await authenticate(req as never, {} as never, next);

    expect(next).toHaveBeenCalledOnce();
    expect(req.user?.userId).toBe('64b000000000000000000001');
  });
});
