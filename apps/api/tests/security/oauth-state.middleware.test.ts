import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('../../src/infrastructure/cache/oauth-state.cache', () => ({
  oauthStateCache: {
    save: vi.fn(),
    consume: vi.fn(),
  },
}));

import { oauthStateCache } from '../../src/infrastructure/cache/oauth-state.cache';
import {
  issueOAuthState,
  validateOAuthState,
} from '../../src/shared/middlewares/oauth-state.middleware';
import {
  createMockRequest,
  createMockResponse,
  createNext,
} from '../helpers/middleware-test-helpers';

const mockedOAuthStateCache = vi.mocked(oauthStateCache);

const issuedStateCookie = (res: ReturnType<typeof createMockResponse>) => {
  const state = String(res.locals.oauthState);
  const entry = [...res.cookiesWritten.entries()].find(([name]) =>
    name.startsWith('imminiq_oauth_state_')
  );
  if (!entry) throw new Error('Expected an OAuth state cookie');
  return { state, cookieName: entry[0], cookieValue: String(entry[1]) };
};

describe('OAuth state middleware', () => {
  beforeEach(() => {
    mockedOAuthStateCache.save.mockResolvedValue(undefined);
    mockedOAuthStateCache.consume.mockResolvedValue(true);
    vi.spyOn(console, 'warn').mockImplementation(() => undefined);
  });

  it('issues a one-time OAuth state nonce and stores it', async () => {
    const req = createMockRequest();
    const res = createMockResponse();
    const next = createNext();

    await issueOAuthState('google')(req, res as never, next);

    expect(mockedOAuthStateCache.save).toHaveBeenCalledTimes(1);
    const issued = issuedStateCookie(res);
    expect(issued.cookieName).toMatch(/^imminiq_oauth_state_google_[a-f0-9]{24}$/);
    expect(issued.cookieValue).toBe(issued.state);
    expect(next).toHaveBeenCalledTimes(1);
  });

  it('validates a matching state query + cookie and consumes Redis state exactly once', async () => {
    const issuedResponse = createMockResponse();
    await issueOAuthState('github')(createMockRequest(), issuedResponse as never, createNext());
    const issued = issuedStateCookie(issuedResponse);

    const req = createMockRequest({
      query: {
        state: issued.state,
      },
      cookies: {
        [issued.cookieName]: issued.cookieValue,
      },
    });
    const res = createMockResponse();
    const next = createNext();

    await validateOAuthState('github')(req, res as never, next);

    expect(mockedOAuthStateCache.consume).toHaveBeenCalledWith('github', issued.state);
    expect(res.cookiesCleared).toContain(issued.cookieName);
    expect(res.redirectedTo).toBeNull();
    expect(next).toHaveBeenCalledTimes(1);
  });

  it('keeps concurrent sign-in attempts independently valid', async () => {
    const firstIssue = createMockResponse();
    const secondIssue = createMockResponse();
    await issueOAuthState('google')(createMockRequest(), firstIssue as never, createNext());
    await issueOAuthState('google')(createMockRequest(), secondIssue as never, createNext());
    const first = issuedStateCookie(firstIssue);
    const second = issuedStateCookie(secondIssue);
    const cookies = {
      [first.cookieName]: first.cookieValue,
      [second.cookieName]: second.cookieValue,
    };

    expect(first.cookieName).not.toBe(second.cookieName);

    for (const issued of [first, second]) {
      const res = createMockResponse();
      const next = createNext();
      await validateOAuthState('google')(
        createMockRequest({ query: { state: issued.state }, cookies }),
        res as never,
        next
      );
      expect(res.redirectedTo).toBeNull();
      expect(res.cookiesCleared).toContain(issued.cookieName);
      expect(next).toHaveBeenCalledOnce();
    }

    expect(mockedOAuthStateCache.consume).toHaveBeenCalledWith('google', first.state);
    expect(mockedOAuthStateCache.consume).toHaveBeenCalledWith('google', second.state);
  });

  it('accepts a matching legacy cookie during a rolling deployment', async () => {
    const state = 'legacy-state';
    const res = createMockResponse();
    const next = createNext();

    await validateOAuthState('google')(
      createMockRequest({
        query: { state },
        cookies: { imminiq_oauth_state_google: state },
      }),
      res as never,
      next
    );

    expect(res.redirectedTo).toBeNull();
    expect(mockedOAuthStateCache.consume).toHaveBeenCalledWith('google', state);
    expect(next).toHaveBeenCalledOnce();
  });

  it('redirects when the OAuth callback has no matching state', async () => {
    const issuedResponse = createMockResponse();
    await issueOAuthState('google')(createMockRequest(), issuedResponse as never, createNext());
    const issued = issuedStateCookie(issuedResponse);
    const req = createMockRequest({
      query: {
        state: issued.state,
      },
      cookies: {
        [issued.cookieName]: 'different-cookie-state',
      },
    });
    const res = createMockResponse();
    const next = createNext();

    await validateOAuthState('google')(req, res as never, next);

    expect(mockedOAuthStateCache.consume).not.toHaveBeenCalled();
    expect(res.redirectedTo).toContain('oauth_state_invalid');
    expect(next).not.toHaveBeenCalled();
  });

  it('redirects when the Redis-backed OAuth state has already been consumed', async () => {
    mockedOAuthStateCache.consume.mockResolvedValue(false);
    const issuedResponse = createMockResponse();
    await issueOAuthState('google')(createMockRequest(), issuedResponse as never, createNext());
    const issued = issuedStateCookie(issuedResponse);

    const req = createMockRequest({
      query: {
        state: issued.state,
      },
      cookies: {
        [issued.cookieName]: issued.cookieValue,
      },
    });
    const res = createMockResponse();
    const next = createNext();

    await validateOAuthState('google')(req, res as never, next);

    expect(mockedOAuthStateCache.consume).toHaveBeenCalledWith('google', issued.state);
    expect(res.redirectedTo).toContain('oauth_state_invalid');
    expect(next).not.toHaveBeenCalled();
  });
});
