import type { NextFunction, Request, Response } from 'express';

import { HttpStatusCode } from '../../../shared/constants/http-status-code.enum';
import { decryptAuthCookieToken } from '../../../shared/security/auth-cookie-token.util';
import { ApiError } from '../../../shared/utils/api-error';
import { ApiResponse } from '../../../shared/utils/api-response';
import { getAuthUser } from '../../../shared/utils/get-auth-user';
import type { SecurityUseCases } from '../application/security-use-cases.contract';

const REFRESH_COOKIE_NAME = 'refreshToken';

export class SecurityController {
  constructor(private readonly _useCases: SecurityUseCases) {}

  getOverview = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const authUser = getAuthUser(req);
      const result = await this._useCases.getSecurityOverview.execute(
        authUser.userId,
        this.getRawRefreshTokenFromCookie(req),
        authUser.sessionId
      );

      res.json(new ApiResponse('Security overview fetched', result));
    } catch (error) {
      next(error);
    }
  };

  requestEmailChange = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await this._useCases.requestEmailChange.execute(
        getAuthUser(req).userId,
        req.body
      );

      res.json(new ApiResponse('Verification link sent to your new email address', result));
    } catch (error) {
      next(error);
    }
  };

  verifyEmailChange = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await this._useCases.verifyEmailChange.execute(req.body);

      res.json(new ApiResponse('Email changed successfully. Please sign in again.', result));
    } catch (error) {
      next(error);
    }
  };

  changePassword = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await this._useCases.changeSecurityPassword.execute(
        getAuthUser(req).userId,
        req.body
      );

      res.json(new ApiResponse('Password changed successfully. Please sign in again.', result));
    } catch (error) {
      next(error);
    }
  };

  revokeSession = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const authUser = getAuthUser(req);
      const result = await this._useCases.revokeSecuritySession.execute(
        authUser.userId,
        this.getRequiredSessionId(req),
        this.getRawRefreshTokenFromCookie(req),
        authUser.sessionId
      );

      res.json(new ApiResponse('Session revoked', result));
    } catch (error) {
      next(error);
    }
  };

  setupTwoFactor = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await this._useCases.setupTwoFactor.execute(getAuthUser(req).userId);

      res.json(new ApiResponse('Two-factor setup started', result));
    } catch (error) {
      next(error);
    }
  };

  verifyTwoFactorSetup = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await this._useCases.verifyTwoFactorSetup.execute(
        getAuthUser(req).userId,
        req.body
      );

      res.json(new ApiResponse('Two-factor authentication enabled', result));
    } catch (error) {
      next(error);
    }
  };

  disableTwoFactor = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await this._useCases.disableTwoFactor.execute(
        getAuthUser(req).userId,
        req.body
      );

      res.json(new ApiResponse('Two-factor authentication disabled', result));
    } catch (error) {
      next(error);
    }
  };

  deleteAccount = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await this._useCases.deleteSecurityAccount.execute(
        getAuthUser(req).userId,
        req.body
      );

      res.json(new ApiResponse('Account deletion scheduled', result));
    } catch (error) {
      next(error);
    }
  };

  private getRawRefreshTokenFromCookie(req: Request): string | undefined {
    const encryptedRefreshToken = req.cookies?.[REFRESH_COOKIE_NAME];

    if (typeof encryptedRefreshToken !== 'string') {
      return undefined;
    }

    try {
      return decryptAuthCookieToken(encryptedRefreshToken);
    } catch {
      return undefined;
    }
  }

  private getRequiredSessionId(req: Request): string {
    const sessionId = Array.isArray(req.params.sessionId)
      ? req.params.sessionId[0]
      : req.params.sessionId;

    if (!sessionId) {
      throw new ApiError(
        HttpStatusCode.BAD_REQUEST,
        'Session id is required',
        'SESSION_ID_REQUIRED'
      );
    }

    return sessionId;
  }
}
