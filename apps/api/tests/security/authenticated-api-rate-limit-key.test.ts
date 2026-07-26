import type { Request } from 'express';
import { describe, expect, it } from 'vitest';

import { getAuthenticatedApiRateLimitKey } from '../../src/shared/middlewares/security-rate-limit.middleware';

const requestFor = (userId: string, ip: string) =>
  ({
    user: { userId, role: 'user', type: 'access' },
    ip,
  }) as Request;

describe('authenticated API rate-limit key', () => {
  it('isolates counters by authenticated user rather than a shared IP address', () => {
    const firstUser = getAuthenticatedApiRateLimitKey(requestFor('user-1', '127.0.0.1'));
    const sameUserElsewhere = getAuthenticatedApiRateLimitKey(requestFor('user-1', '203.0.113.20'));
    const secondUser = getAuthenticatedApiRateLimitKey(requestFor('user-2', '127.0.0.1'));

    expect(firstUser).toBe('user:user-1');
    expect(sameUserElsewhere).toBe(firstUser);
    expect(secondUser).toBe('user:user-2');
  });
});
