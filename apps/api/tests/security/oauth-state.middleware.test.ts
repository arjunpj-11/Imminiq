import { beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('../../src/infrastructure/cache/oauth-state.cache', () => ({
  oauthStateCache: {
    save: vi.fn(),
    consume: vi.fn(),
  },
}))

import { oauthStateCache } from '../../src/infrastructure/cache/oauth-state.cache'
import {
  issueOAuthState,
  validateOAuthState,
} from '../../src/shared/middlewares/oauth-state.middleware'
import {
  createMockRequest,
  createMockResponse,
  createNext,
} from '../helpers/middleware-test-helpers'

const mockedOAuthStateCache = vi.mocked(oauthStateCache)

describe('OAuth state middleware', () => {
  beforeEach(() => {
    mockedOAuthStateCache.save.mockResolvedValue(undefined)
    mockedOAuthStateCache.consume.mockResolvedValue(true)
  })

  it('issues a one-time OAuth state nonce and stores it', async () => {
    const req = createMockRequest()
    const res = createMockResponse()
    const next = createNext()

    await issueOAuthState('google')(req, res as never, next)

    expect(mockedOAuthStateCache.save).toHaveBeenCalledTimes(1)
    expect(res.cookiesWritten.has('imminiq_oauth_state_google')).toBe(true)
    expect(typeof res.locals.oauthState).toBe('string')
    expect(next).toHaveBeenCalledTimes(1)
  })

  it('validates a matching state query + cookie and consumes Redis state exactly once', async () => {
    const state = 'matching-state'

    const req = createMockRequest({
      query: {
        state,
      },
      cookies: {
        imminiq_oauth_state_github: state,
      },
    })
    const res = createMockResponse()
    const next = createNext()

    await validateOAuthState('github')(req, res as never, next)

    expect(mockedOAuthStateCache.consume).toHaveBeenCalledWith(
      'github',
      state
    )
    expect(res.cookiesCleared).toContain('imminiq_oauth_state_github')
    expect(res.redirectedTo).toBeNull()
    expect(next).toHaveBeenCalledTimes(1)
  })

  it('redirects when the OAuth callback has no matching state', async () => {
    const req = createMockRequest({
      query: {
        state: 'query-state',
      },
      cookies: {
        imminiq_oauth_state_google: 'cookie-state',
      },
    })
    const res = createMockResponse()
    const next = createNext()

    await validateOAuthState('google')(req, res as never, next)

    expect(mockedOAuthStateCache.consume).not.toHaveBeenCalled()
    expect(res.redirectedTo).toContain('oauth_state_invalid')
    expect(next).not.toHaveBeenCalled()
  })

  it('redirects when the Redis-backed OAuth state has already been consumed', async () => {
    mockedOAuthStateCache.consume.mockResolvedValue(false)

    const state = 'replayed-state'

    const req = createMockRequest({
      query: {
        state,
      },
      cookies: {
        imminiq_oauth_state_google: state,
      },
    })
    const res = createMockResponse()
    const next = createNext()

    await validateOAuthState('google')(req, res as never, next)

    expect(mockedOAuthStateCache.consume).toHaveBeenCalledWith(
      'google',
      state
    )
    expect(res.redirectedTo).toContain('oauth_state_invalid')
    expect(next).not.toHaveBeenCalled()
  })
})
