import type { CookieOptions, Request, Response, NextFunction } from 'express';

import { env } from '../../../config/env';
import { clearCsrfCookie, setCsrfCookie } from '../../../shared/middlewares/csrf-token.middleware';
import {
  decryptAuthCookieToken,
  encryptAuthCookieToken,
} from '../../../shared/security/auth-cookie-token.util';
import { HttpStatusCode } from '../../../shared/constants/http-status-code.enum';
import { ApiError } from '../../../shared/utils/ApiError';
import { ApiResponse } from '../../../shared/utils/ApiResponse';
import { getAuthUser } from '../../../shared/utils/getAuthUser';
import type { AuthUseCases } from '../application/auth-use-cases.contract';
import type { OAuthLoginUserDTO } from '../application/auth.dto';

const REFRESH_COOKIE_NAME = 'refreshToken';
const TWO_FACTOR_CHALLENGE_COOKIE_NAME = 'twoFactorChallengeToken';

const AUTH_COOKIE_PATH = '/api/auth';

const isProduction = env.NODE_ENV === 'production';

const CROSS_SITE_COOKIE_OPTIONS: Pick<CookieOptions, 'secure' | 'sameSite' | 'path'> = {
  secure: isProduction,
  sameSite: isProduction ? 'none' : 'lax',
  path: AUTH_COOKIE_PATH,
};

const COOKIE_OPTIONS: CookieOptions = {
  httpOnly: true,
  ...CROSS_SITE_COOKIE_OPTIONS,
  maxAge: env.REFRESH_TOKEN_TTL_MS,
};

const TWO_FACTOR_COOKIE_OPTIONS: CookieOptions = {
  httpOnly: true,
  ...CROSS_SITE_COOKIE_OPTIONS,
  maxAge: env.TWO_FACTOR_CHALLENGE_TTL_MINUTES * 60 * 1000,
};

const LEGACY_ROOT_COOKIE_OPTIONS: CookieOptions = {
  ...COOKIE_OPTIONS,
  path: '/',
};

const LEGACY_ROOT_TWO_FACTOR_COOKIE_OPTIONS: CookieOptions = {
  ...TWO_FACTOR_COOKIE_OPTIONS,
  path: '/',
};

export class AuthController {
  constructor(private readonly _useCases: AuthUseCases) {}

  register = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await this._useCases.registerUser.execute(req.body);

      res
        .status(HttpStatusCode.ACCEPTED)
        .json(new ApiResponse('Registration started. Please verify your account.', result));
    } catch (error) {
      next(error);
    }
  };

  login = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await this._useCases.loginUser.execute(req.body, this.getRequestMeta(req));

      if (result.requiresTwoFactor === true) {
        this.setTwoFactorChallengeCookies(res, result.challengeToken);

        res.json(
          new ApiResponse('Two-factor verification required', {
            requiresTwoFactor: true,
            challengeExpiresInMinutes: result.challengeExpiresInMinutes,
          })
        );

        return;
      }

      this.setRefreshSessionCookies(res, result.tokens.refreshToken);

      res.json(
        new ApiResponse('Login successful', {
          accessToken: result.tokens.accessToken,
          user: result.user,
          redirectPath: result.redirectPath,
        })
      );
    } catch (error) {
      const errorCode = this.getAuthErrorCode(error);

      if (this.isRestrictedAccountCode(errorCode)) {
        this.clearAuthCookies(res);
      }

      next(error);
    }
  };

  verifyTwoFactorLogin = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const challengeToken = this.decryptRequiredCookie(
        req,
        TWO_FACTOR_CHALLENGE_COOKIE_NAME,
        'Two-factor challenge is missing. Please sign in again.',
        'TWO_FACTOR_CHALLENGE_MISSING',
        'Two-factor challenge is invalid. Please sign in again.',
        'TWO_FACTOR_CHALLENGE_INVALID'
      );

      const result = await this._useCases.verifyTwoFactorLogin.execute(
        challengeToken,
        req.body,
        this.getRequestMeta(req)
      );

      this.setRefreshSessionCookies(res, result.tokens.refreshToken);

      res
        .clearCookie(TWO_FACTOR_CHALLENGE_COOKIE_NAME, TWO_FACTOR_COOKIE_OPTIONS)
        .clearCookie(TWO_FACTOR_CHALLENGE_COOKIE_NAME, LEGACY_ROOT_TWO_FACTOR_COOKIE_OPTIONS)
        .json(
          new ApiResponse('Two-factor verification successful', {
            accessToken: result.tokens.accessToken,
            user: result.user,
            redirectPath: result.redirectPath,
          })
        );
    } catch (error) {
      const errorCode = this.getAuthErrorCode(error);

      if (this.isRestrictedAccountCode(errorCode)) {
        this.clearAuthCookies(res);
      }

      next(error);
    }
  };

  logout = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const encryptedRefreshToken = req.cookies?.[REFRESH_COOKIE_NAME];

      if (typeof encryptedRefreshToken === 'string') {
        try {
          const refreshToken = decryptAuthCookieToken(encryptedRefreshToken);

          await this._useCases.logoutUser.execute(refreshToken);
        } catch {
          // Invalid or stale encrypted cookies should still be cleared.
        }
      }

      this.clearAuthCookies(res);

      res.json(new ApiResponse('Logged out successfully'));
    } catch (error) {
      next(error);
    }
  };

  refreshToken = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const refreshToken = this.decryptRequiredCookie(
        req,
        REFRESH_COOKIE_NAME,
        'No refresh token',
        'NO_REFRESH_TOKEN',
        'Refresh token cookie is invalid',
        'INVALID_REFRESH_COOKIE'
      );

      const tokens = await this._useCases.refreshAuthTokens.execute(
        refreshToken,
        this.getRequestMeta(req)
      );

      this.setRefreshSessionCookies(res, tokens.refreshToken);

      res.json(
        new ApiResponse('Token refreshed', {
          accessToken: tokens.accessToken,
        })
      );
    } catch (error) {
      const errorCode = this.getAuthErrorCode(error);

      if (this.isRestrictedAccountCode(errorCode)) {
        this.clearAuthCookies(res);
      }

      next(error);
    }
  };

  getMe = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = await this._useCases.getCurrentUser.execute(getAuthUser(req).userId);

      res.json(new ApiResponse('User fetched', { user }));
    } catch (error) {
      next(error);
    }
  };

  verifyAccount = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { identifier, otp } = req.body;

      await this._useCases.verifyAccount.execute(identifier, otp);

      res.json(new ApiResponse('Account verified successfully'));
    } catch (error) {
      next(error);
    }
  };

  sendOtp = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { identifier, purpose } = req.body;

      await this._useCases.resendOtp.execute(identifier, purpose);

      res.json(new ApiResponse('OTP sent successfully'));
    } catch (error) {
      next(error);
    }
  };

  forgotPassword = async (req: Request, res: Response, next: NextFunction) => {
    try {
      await this._useCases.forgotPassword.execute(req.body.identifier);

      res.json(new ApiResponse('If this account exists, a reset code has been sent'));
    } catch (error) {
      next(error);
    }
  };

  verifyResetCode = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { identifier, otp } = req.body;

      const result = await this._useCases.verifyResetCode.execute(identifier, otp);

      res.json(new ApiResponse('Code verified', result));
    } catch (error) {
      next(error);
    }
  };

  resetPassword = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { resetToken, newPassword } = req.body;

      await this._useCases.resetPassword.execute(resetToken, newPassword);

      res.json(new ApiResponse('Password reset successfully'));
    } catch (error) {
      next(error);
    }
  };

  oauthCallback = async (req: Request, res: Response) => {
    try {
      if (!req.user) {
        throw new ApiError(
          HttpStatusCode.UNAUTHORIZED,
          'OAuth authentication failed',
          'OAUTH_USER_MISSING'
        );
      }

      const result = await this._useCases.handleOAuthLogin.execute(
        req.user as unknown as OAuthLoginUserDTO,
        this.getRequestMeta(req)
      );

      if (result.requiresTwoFactor === true) {
        this.setTwoFactorChallengeCookies(res, result.challengeToken);

        res.redirect(`${env.CLIENT_URL}/two-factor-challenge`);
        return;
      }

      this.setRefreshSessionCookies(res, result.tokens.refreshToken);

      res.redirect(`${env.CLIENT_URL}${result.redirectPath}`);
    } catch (error) {
      const errorCode = this.getAuthErrorCode(error);

      this.clearAuthCookies(res);

      if (this.isRestrictedAccountCode(errorCode)) {
        res.redirect(`${env.CLIENT_URL}/blocked`);
        return;
      }

      res.redirect(this.buildOAuthFailureRedirectUrl(errorCode));
    }
  };

  private buildOAuthFailureRedirectUrl(code?: string) {
    const searchParams = new URLSearchParams({
      error: 'oauth_failed',
    });

    if (code && this.isSafeClientErrorCode(code)) {
      searchParams.set('code', code);
    }

    return `${env.CLIENT_URL}/login?${searchParams.toString()}`;
  }

  private isSafeClientErrorCode(code: string) {
    return /^[A-Z0-9_]+$/.test(code);
  }

  private getRequestMeta(req: Request) {
    return {
      device: req.headers['sec-ch-ua-platform']?.toString(),
      userAgent: req.headers['user-agent'],
      ipAddress: req.ip,
    };
  }

  private getAuthErrorCode(error: unknown) {
    const authError = error as {
      code?: string;
      errorCode?: string;
    };

    return authError.code || authError.errorCode;
  }

  private isRestrictedAccountCode(code?: string) {
    return (
      code === 'ACCOUNT_BLOCKED' ||
      code === 'ACCOUNT_BANNED' ||
      code === 'ACCOUNT_DEACTIVATED' ||
      code === 'ACCOUNT_PAUSED'
    );
  }

  private clearAuthCookies(res: Response) {
    res
      .clearCookie(REFRESH_COOKIE_NAME, COOKIE_OPTIONS)
      .clearCookie(TWO_FACTOR_CHALLENGE_COOKIE_NAME, TWO_FACTOR_COOKIE_OPTIONS)
      .clearCookie(REFRESH_COOKIE_NAME, LEGACY_ROOT_COOKIE_OPTIONS)
      .clearCookie(TWO_FACTOR_CHALLENGE_COOKIE_NAME, LEGACY_ROOT_TWO_FACTOR_COOKIE_OPTIONS);

    clearCsrfCookie(res);
  }

  private setRefreshSessionCookies(res: Response, rawRefreshToken: string): void {
    res.cookie(REFRESH_COOKIE_NAME, encryptAuthCookieToken(rawRefreshToken), COOKIE_OPTIONS);

    setCsrfCookie(res);
  }

  private setTwoFactorChallengeCookies(res: Response, rawChallengeToken: string): void {
    res.cookie(
      TWO_FACTOR_CHALLENGE_COOKIE_NAME,
      encryptAuthCookieToken(rawChallengeToken),
      TWO_FACTOR_COOKIE_OPTIONS
    );

    setCsrfCookie(res);
  }

  private decryptRequiredCookie(
    req: Request,
    cookieName: string,
    missingMessage: string,
    missingCode: string,
    invalidMessage: string,
    invalidCode: string
  ): string {
    const encryptedCookieValue = req.cookies?.[cookieName];

    if (typeof encryptedCookieValue !== 'string') {
      throw new ApiError(HttpStatusCode.UNAUTHORIZED, missingMessage, missingCode);
    }

    try {
      return decryptAuthCookieToken(encryptedCookieValue);
    } catch {
      throw new ApiError(HttpStatusCode.UNAUTHORIZED, invalidMessage, invalidCode);
    }
  }
}
