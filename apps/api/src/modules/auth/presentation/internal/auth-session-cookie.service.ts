import type { CookieOptions, Request, Response } from 'express';

import { env } from '../../../../config/env';
import {
  clearCsrfCookie,
  setCsrfCookie,
} from '../../../../shared/middlewares/csrf-token.middleware';
import {
  decryptAuthCookieToken,
  encryptAuthCookieToken,
} from '../../../../shared/security/auth-cookie-token.util';
import { AuthPresentationError } from './auth-presentation.error';

const REFRESH_COOKIE_NAME = 'refreshToken';
const TWO_FACTOR_CHALLENGE_COOKIE_NAME = 'twoFactorChallengeToken';
const AUTH_COOKIE_PATH = '/api/auth';

const crossSiteCookieOptions: Pick<CookieOptions, 'secure' | 'sameSite' | 'path'> = {
  secure: env.NODE_ENV === 'production',
  sameSite: env.NODE_ENV === 'production' ? 'none' : 'lax',
  path: AUTH_COOKIE_PATH,
};

const productionCookieDomain = env.NODE_ENV === 'production' ? env.AUTH_COOKIE_DOMAIN : undefined;

const refreshCookieOptions: CookieOptions = {
  httpOnly: true,
  ...crossSiteCookieOptions,
  ...(productionCookieDomain ? { domain: productionCookieDomain } : {}),
  priority: 'high',
  maxAge: env.REFRESH_TOKEN_TTL_MS,
};

const twoFactorCookieOptions: CookieOptions = {
  httpOnly: true,
  ...crossSiteCookieOptions,
  ...(productionCookieDomain ? { domain: productionCookieDomain } : {}),
  priority: 'high',
  maxAge: env.TWO_FACTOR_CHALLENGE_TTL_MINUTES * 60 * 1000,
};

const atRoot = (options: CookieOptions): CookieOptions => ({ ...options, path: '/' });

export interface IAuthSessionCookieService {
  clear(res: Response): void;
  readOptionalRefreshToken(req: Request): string | null;
  readRequiredRefreshToken(req: Request): string;
  readRequiredTwoFactorChallenge(req: Request): string;
  setRefreshSession(res: Response, rawRefreshToken: string): void;
  setTwoFactorChallenge(res: Response, rawChallengeToken: string): void;
  clearTwoFactorChallenge(res: Response): void;
}

export class AuthSessionCookieService implements IAuthSessionCookieService {
  clear(res: Response): void {
    res
      .clearCookie(REFRESH_COOKIE_NAME, refreshCookieOptions)
      .clearCookie(TWO_FACTOR_CHALLENGE_COOKIE_NAME, twoFactorCookieOptions)
      .clearCookie(REFRESH_COOKIE_NAME, atRoot(refreshCookieOptions))
      .clearCookie(TWO_FACTOR_CHALLENGE_COOKIE_NAME, atRoot(twoFactorCookieOptions));

    clearCsrfCookie(res);
  }

  readOptionalRefreshToken(req: Request): string | null {
    const encryptedValue = req.cookies?.[REFRESH_COOKIE_NAME];
    if (typeof encryptedValue !== 'string') return null;

    try {
      return decryptAuthCookieToken(encryptedValue);
    } catch {
      return null;
    }
  }

  readRequiredRefreshToken(req: Request): string {
    return this.readRequired(
      req,
      REFRESH_COOKIE_NAME,
      'No refresh token',
      'NO_REFRESH_TOKEN',
      'Refresh token cookie is invalid',
      'INVALID_REFRESH_COOKIE'
    );
  }

  readRequiredTwoFactorChallenge(req: Request): string {
    return this.readRequired(
      req,
      TWO_FACTOR_CHALLENGE_COOKIE_NAME,
      'Two-factor challenge is missing. Please sign in again.',
      'TWO_FACTOR_CHALLENGE_MISSING',
      'Two-factor challenge is invalid. Please sign in again.',
      'TWO_FACTOR_CHALLENGE_INVALID'
    );
  }

  setRefreshSession(res: Response, rawRefreshToken: string): void {
    res.cookie(REFRESH_COOKIE_NAME, encryptAuthCookieToken(rawRefreshToken), refreshCookieOptions);
    setCsrfCookie(res);
  }

  setTwoFactorChallenge(res: Response, rawChallengeToken: string): void {
    res.cookie(
      TWO_FACTOR_CHALLENGE_COOKIE_NAME,
      encryptAuthCookieToken(rawChallengeToken),
      twoFactorCookieOptions
    );
    setCsrfCookie(res);
  }

  clearTwoFactorChallenge(res: Response): void {
    res
      .clearCookie(TWO_FACTOR_CHALLENGE_COOKIE_NAME, twoFactorCookieOptions)
      .clearCookie(TWO_FACTOR_CHALLENGE_COOKIE_NAME, atRoot(twoFactorCookieOptions));
  }

  private readRequired(
    req: Request,
    cookieName: string,
    missingMessage: string,
    missingCode: string,
    invalidMessage: string,
    invalidCode: string
  ): string {
    const encryptedValue = req.cookies?.[cookieName];
    if (typeof encryptedValue !== 'string') {
      throw new AuthPresentationError(missingCode, missingMessage);
    }

    try {
      return decryptAuthCookieToken(encryptedValue);
    } catch {
      throw new AuthPresentationError(invalidCode, invalidMessage);
    }
  }
}
