import jwt from 'jsonwebtoken';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { env } from '../../src/config/env';
import { AuthToken } from '../../src/infrastructure/database/models/auth-token.model';
import { User } from '../../src/infrastructure/database/models/user.model';
import { authenticate } from '../../src/shared/middlewares/auth.middleware';

const token = () =>
  jwt.sign(
    {
      userId: '64b000000000000000000001',
      role: 'user',
      type: 'access',
      sessionId: '64b000000000000000000002',
    },
    env.JWT_SECRET,
    { algorithm: 'HS256', issuer: 'imminiq-api', audience: 'imminiq-web' }
  );

const request = () => ({ headers: { authorization: `Bearer ${token()}` } }) as never;
const response = () => ({ locals: {} }) as never;

describe('account status authentication enforcement', () => {
  afterEach(() => vi.restoreAllMocks());

  const mockActiveSession = () =>
    vi.spyOn(AuthToken, 'exists').mockResolvedValue({ _id: 'active-session' } as never);

  it('rejects an already-issued token immediately after suspension', async () => {
    mockActiveSession();
    vi.spyOn(User, 'findOne').mockReturnValue({
      select: () => ({
        lean: () =>
          Promise.resolve({
            status: 'paused',
            role: 'user',
            adminStatusReason: 'A temporary security review is required.',
          }),
      }),
    } as never);

    await expect(authenticate(request(), response(), vi.fn())).rejects.toMatchObject({
      statusCode: 403,
      code: 'ACCOUNT_PAUSED',
    });
  });

  it('allows an active account and attaches the verified identity', async () => {
    mockActiveSession();
    vi.spyOn(User, 'findOne').mockReturnValue({
      select: () => ({ lean: () => Promise.resolve({ status: 'active', role: 'user' }) }),
    } as never);
    const req = request() as { user?: { userId: string } };
    const next = vi.fn();

    await authenticate(req as never, response(), next);

    expect(next).toHaveBeenCalledOnce();
    expect(req.user?.userId).toBe('64b000000000000000000001');
  });

  it('invalidates an issued token when the account role changes', async () => {
    mockActiveSession();
    vi.spyOn(User, 'findOne').mockReturnValue({
      select: () => ({ lean: () => Promise.resolve({ status: 'active', role: 'admin' }) }),
    } as never);

    await expect(authenticate(request(), response(), vi.fn())).rejects.toMatchObject({
      statusCode: 401,
      code: 'SESSION_ROLE_CHANGED',
    });
  });
});
