import type { Request, Response, NextFunction } from 'express';

import { env } from '../../../config/env';
import { HttpStatusCode } from '../../../shared/constants/http-status-code.enum';
import { ApiResponse } from '../../../shared/utils/api-response';
import { getAuthUser } from '../../../shared/utils/get-auth-user';
import type { AuthUseCases } from '../application/auth-use-cases.contract';
import type { OAuthLoginUserDTO } from '../application/auth.dto';
import {
  buildOAuthFailureRedirectUrl,
  getAuthErrorCode,
  isRestrictedAccountCode,
} from './internal/auth-error.policy';
import { AuthPresentationError } from './internal/auth-presentation.error';
import { toAuthRequestMeta } from './internal/auth-request.mapper';
import type { IAuthSessionCookieService } from './internal/auth-session-cookie.service';

export class AuthController {
  constructor(
    private readonly _useCases: AuthUseCases,
    private readonly _cookies: IAuthSessionCookieService
  ) {}

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
      const result = await this._useCases.loginUser.execute(req.body, toAuthRequestMeta(req));

      if (result.requiresTwoFactor === true) {
        this._cookies.setTwoFactorChallenge(res, result.challengeToken);

        res.json(
          new ApiResponse('Two-factor verification required', {
            requiresTwoFactor: true,
            challengeExpiresInMinutes: result.challengeExpiresInMinutes,
          })
        );

        return;
      }

      this._cookies.setRefreshSession(res, result.tokens.refreshToken);

      res.json(
        new ApiResponse('Login successful', {
          accessToken: result.tokens.accessToken,
          user: result.user,
          redirectPath: result.redirectPath,
        })
      );
    } catch (error) {
      const errorCode = getAuthErrorCode(error);

      if (isRestrictedAccountCode(errorCode)) {
        this._cookies.clear(res);
      }

      next(error);
    }
  };

  verifyTwoFactorLogin = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const challengeToken = this._cookies.readRequiredTwoFactorChallenge(req);

      const result = await this._useCases.verifyTwoFactorLogin.execute(
        challengeToken,
        req.body,
        toAuthRequestMeta(req)
      );

      this._cookies.setRefreshSession(res, result.tokens.refreshToken);
      this._cookies.clearTwoFactorChallenge(res);

      res.json(
        new ApiResponse('Two-factor verification successful', {
          accessToken: result.tokens.accessToken,
          user: result.user,
          redirectPath: result.redirectPath,
        })
      );
    } catch (error) {
      const errorCode = getAuthErrorCode(error);

      if (isRestrictedAccountCode(errorCode)) {
        this._cookies.clear(res);
      }

      next(error);
    }
  };

  logout = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const refreshToken = this._cookies.readOptionalRefreshToken(req);

      if (refreshToken) {
        try {
          await this._useCases.logoutUser.execute(refreshToken);
        } catch {
          // Logout remains idempotent for stale/revoked sessions; local cookies are still cleared.
        }
      }

      this._cookies.clear(res);

      res.json(new ApiResponse('Logged out successfully'));
    } catch (error) {
      next(error);
    }
  };

  refreshToken = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const refreshToken = this._cookies.readRequiredRefreshToken(req);

      const tokens = await this._useCases.refreshAuthTokens.execute(
        refreshToken,
        toAuthRequestMeta(req)
      );

      this._cookies.setRefreshSession(res, tokens.refreshToken);

      res.json(
        new ApiResponse('Token refreshed', {
          accessToken: tokens.accessToken,
          user: tokens.user,
        })
      );
    } catch (error) {
      const errorCode = getAuthErrorCode(error);

      if (isRestrictedAccountCode(errorCode)) {
        this._cookies.clear(res);
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
        throw new AuthPresentationError('OAUTH_USER_MISSING', 'OAuth authentication failed');
      }

      const result = await this._useCases.handleOAuthLogin.execute(
        req.user as unknown as OAuthLoginUserDTO,
        toAuthRequestMeta(req)
      );

      if (result.requiresTwoFactor === true) {
        this._cookies.setTwoFactorChallenge(res, result.challengeToken);

        res.redirect(`${env.CLIENT_URL}/two-factor-challenge`);
        return;
      }

      this._cookies.setRefreshSession(res, result.tokens.refreshToken);

      res.redirect(`${env.CLIENT_URL}${result.redirectPath}`);
    } catch (error) {
      const errorCode = getAuthErrorCode(error);

      this._cookies.clear(res);

      if (isRestrictedAccountCode(errorCode)) {
        res.redirect(`${env.CLIENT_URL}/blocked`);
        return;
      }

      res.redirect(buildOAuthFailureRedirectUrl(env.CLIENT_URL, errorCode));
    }
  };
}
