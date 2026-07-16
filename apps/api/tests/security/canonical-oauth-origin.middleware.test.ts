import { describe, expect, it } from 'vitest';

import { useCanonicalOAuthOrigin } from '../../src/modules/auth/presentation/internal/canonical-oauth-origin.middleware';
import {
  createMockRequest,
  createMockResponse,
  createNext,
} from '../helpers/middleware-test-helpers';

describe('canonical OAuth origin middleware', () => {
  it('redirects a frontend-proxied OAuth start to the API before state is issued', () => {
    const req = createMockRequest({
      originalUrl: '/api/auth/oauth/google',
      headers: {
        host: 'localhost:5009',
        'x-forwarded-host': 'localhost:5173',
      },
    });
    const res = createMockResponse();
    const next = createNext();

    useCanonicalOAuthOrigin(req, res as never, next);

    expect(res.redirectedTo).toBe('http://localhost:5009/api/auth/oauth/google');
    expect(next).not.toHaveBeenCalled();
  });

  it('continues when OAuth already starts on the canonical API host', () => {
    const req = createMockRequest({
      originalUrl: '/api/auth/oauth/google',
      headers: { host: 'localhost:5009' },
    });
    const res = createMockResponse();
    const next = createNext();

    useCanonicalOAuthOrigin(req, res as never, next);

    expect(res.redirectedTo).toBeNull();
    expect(next).toHaveBeenCalledOnce();
  });
});

