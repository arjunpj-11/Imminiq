import { createHash, randomBytes, timingSafeEqual } from 'crypto';
import type { NextFunction, Request, Response } from 'express';

import { env } from '../../config/env';
import { oauthStateCache, type OAuthProvider } from '../../infrastructure/cache/oauth-state.cache';

const legacyCookieNameFor = (provider: OAuthProvider) => `imminiq_oauth_state_${provider}`;

const cookieNameFor = (provider: OAuthProvider, state: string) => {
  const fingerprint = createHash('sha256').update(state).digest('hex').slice(0, 24);
  return `${legacyCookieNameFor(provider)}_${fingerprint}`;
};

const getCookieOptions = () => ({
  httpOnly: true,
  secure: env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  path: '/api/auth/oauth',
  maxAge: env.OAUTH_STATE_TTL_SECONDS * 1000,
});

const safeEquals = (left: string, right: string): boolean => {
  const leftBuffer = Buffer.from(left);
  const rightBuffer = Buffer.from(right);

  if (leftBuffer.length !== rightBuffer.length) {
    return false;
  }

  return timingSafeEqual(leftBuffer, rightBuffer);
};

const oauthStateFailureRedirect = () => {
  return `${env.CLIENT_URL}/login?error=oauth_state_invalid`;
};

type OAuthStateFailureReason =
  | 'missing_query_state'
  | 'missing_cookie_state'
  | 'cookie_state_mismatch'
  | 'expired_or_consumed_state';

const rejectOAuthState = (
  provider: OAuthProvider,
  reason: OAuthStateFailureReason,
  res: Response
) => {
  console.warn('[OAuthState] Validation rejected', { provider, reason });
  res.redirect(oauthStateFailureRedirect());
};

export const issueOAuthState =
  (provider: OAuthProvider) => async (_req: Request, res: Response, next: NextFunction) => {
    try {
      const state = randomBytes(32).toString('hex');

      await oauthStateCache.save(provider, state, env.OAUTH_STATE_TTL_SECONDS);

      res.cookie(cookieNameFor(provider, state), state, getCookieOptions());

      res.locals.oauthState = state;

      next();
    } catch (error) {
      next(error);
    }
  };

export const validateOAuthState =
  (provider: OAuthProvider) => async (req: Request, res: Response, next: NextFunction) => {
    try {
      const state = typeof req.query.state === 'string' ? req.query.state : '';
      const stateCookieName = cookieNameFor(provider, state);
      const currentCookieState = req.cookies?.[stateCookieName];
      const legacyCookieState = req.cookies?.[legacyCookieNameFor(provider)];
      const cookieState =
        typeof currentCookieState === 'string'
          ? currentCookieState
          : typeof legacyCookieState === 'string'
            ? legacyCookieState
            : '';
      const clearOptions = { ...getCookieOptions(), maxAge: undefined };

      res.clearCookie(stateCookieName, clearOptions);
      res.clearCookie(legacyCookieNameFor(provider), clearOptions);

      if (!state) {
        rejectOAuthState(provider, 'missing_query_state', res);
        return;
      }

      if (!cookieState) {
        rejectOAuthState(provider, 'missing_cookie_state', res);
        return;
      }

      if (!safeEquals(state, cookieState)) {
        rejectOAuthState(provider, 'cookie_state_mismatch', res);
        return;
      }

      const activeState = await oauthStateCache.consume(provider, state);

      if (!activeState) {
        rejectOAuthState(provider, 'expired_or_consumed_state', res);
        return;
      }

      next();
    } catch (error) {
      next(error);
    }
  };
