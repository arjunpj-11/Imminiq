import {
  randomBytes,
  timingSafeEqual,
} from 'crypto'
import type {
  NextFunction,
  Request,
  Response,
} from 'express'

import { env } from '../../config/env'
import {
  oauthStateCache,
  type OAuthProvider,
} from '../../infrastructure/cache/oauth-state.cache'

const OAUTH_STATE_TTL_SECONDS = 10 * 60

const cookieNameFor = (provider: OAuthProvider) => {
  return `imminiq_oauth_state_${provider}`
}

const getCookieOptions = () => ({
  httpOnly: true,
  secure: env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  path: '/api/auth/oauth',
  maxAge: OAUTH_STATE_TTL_SECONDS * 1000,
})

const safeEquals = (
  left: string,
  right: string
): boolean => {
  const leftBuffer = Buffer.from(left)
  const rightBuffer = Buffer.from(right)

  if (leftBuffer.length !== rightBuffer.length) {
    return false
  }

  return timingSafeEqual(leftBuffer, rightBuffer)
}

const oauthStateFailureRedirect = () => {
  return `${env.CLIENT_URL}/login?error=oauth_state_invalid`
}

export const issueOAuthState =
  (provider: OAuthProvider) =>
  async (
    _req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const state = randomBytes(32).toString('hex')

      await oauthStateCache.save(
        provider,
        state,
        OAUTH_STATE_TTL_SECONDS
      )

      res.cookie(
        cookieNameFor(provider),
        state,
        getCookieOptions()
      )

      res.locals.oauthState = state

      next()
    } catch (error) {
      next(error)
    }
  }

export const validateOAuthState =
  (provider: OAuthProvider) =>
  async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const state =
        typeof req.query.state === 'string'
          ? req.query.state
          : ''

      const cookieState =
        typeof req.cookies?.[cookieNameFor(provider)] === 'string'
          ? req.cookies[cookieNameFor(provider)]
          : ''

      res.clearCookie(cookieNameFor(provider), {
        ...getCookieOptions(),
        maxAge: undefined,
      })

      if (!state || !cookieState || !safeEquals(state, cookieState)) {
        res.redirect(oauthStateFailureRedirect())
        return
      }

      const activeState = await oauthStateCache.consume(
        provider,
        state
      )

      if (!activeState) {
        res.redirect(oauthStateFailureRedirect())
        return
      }

      next()
    } catch (error) {
      next(error)
    }
  }
