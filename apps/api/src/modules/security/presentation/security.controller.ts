import type { NextFunction, Request, Response } from 'express'

import { decryptAuthCookieToken } from '../../../shared/security/auth-cookie-token.util'
import { ApiError } from '../../../shared/utils/ApiError'
import { ApiResponse } from '../../../shared/utils/ApiResponse'
import { getAuthUser } from '../../../shared/utils/getAuthUser'
import { securityService, type SecurityService } from '../security.service'

export class SecurityController {
  constructor(private readonly service: SecurityService) {}

  getOverview = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await this.service.getOverview(
        getAuthUser(req).userId,
        this.getRawRefreshTokenFromCookie(req),
      )

      res.json(new ApiResponse('Security overview fetched', result))
    } catch (error) {
      next(error)
    }
  }

  requestEmailChange = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const result = await this.service.requestEmailChange(
        getAuthUser(req).userId,
        req.body,
      )

      res.json(
        new ApiResponse(
          'Verification link sent to your new email address',
          result,
        ),
      )
    } catch (error) {
      next(error)
    }
  }

  verifyEmailChange = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const result = await this.service.verifyEmailChange(req.body)

      res.json(
        new ApiResponse(
          'Email changed successfully. Please sign in again.',
          result,
        ),
      )
    } catch (error) {
      next(error)
    }
  }

  changePassword = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await this.service.changePassword(
        getAuthUser(req).userId,
        req.body,
      )

      res.json(
        new ApiResponse(
          'Password changed successfully. Please sign in again.',
          result,
        ),
      )
    } catch (error) {
      next(error)
    }
  }

  getSessions = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await this.service.getSessions(
        getAuthUser(req).userId,
        this.getRawRefreshTokenFromCookie(req),
      )

      res.json(new ApiResponse('Security sessions fetched', result))
    } catch (error) {
      next(error)
    }
  }

  revokeSession = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await this.service.revokeSession(
        getAuthUser(req).userId,
        this.getRequiredSessionId(req),
        this.getRawRefreshTokenFromCookie(req),
      )

      res.json(new ApiResponse('Session revoked', result))
    } catch (error) {
      next(error)
    }
  }

  getTwoFactorStatus = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const result = await this.service.getTwoFactorStatus(
        getAuthUser(req).userId,
      )

      res.json(new ApiResponse('Two-factor status fetched', result))
    } catch (error) {
      next(error)
    }
  }

  setupTwoFactor = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await this.service.setupTwoFactor(getAuthUser(req).userId)

      res.json(new ApiResponse('Two-factor setup started', result))
    } catch (error) {
      next(error)
    }
  }

  verifyTwoFactorSetup = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const result = await this.service.verifyTwoFactorSetup(
        getAuthUser(req).userId,
        req.body,
      )

      res.json(new ApiResponse('Two-factor authentication enabled', result))
    } catch (error) {
      next(error)
    }
  }

  disableTwoFactor = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const result = await this.service.disableTwoFactor(
        getAuthUser(req).userId,
        req.body,
      )

      res.json(new ApiResponse('Two-factor authentication disabled', result))
    } catch (error) {
      next(error)
    }
  }

  deleteAccount = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await this.service.deleteAccount(
        getAuthUser(req).userId,
        req.body,
      )

      res.json(new ApiResponse('Account deletion scheduled', result))
    } catch (error) {
      next(error)
    }
  }

  private getRawRefreshTokenFromCookie(req: Request): string | undefined {
    const encryptedRefreshToken = req.cookies?.refreshToken

    if (typeof encryptedRefreshToken !== 'string') {
      return undefined
    }

    try {
      return decryptAuthCookieToken(encryptedRefreshToken)
    } catch {
      return undefined
    }
  }

  private getRequiredSessionId(req: Request): string {
    const sessionId = Array.isArray(req.params.sessionId)
      ? req.params.sessionId[0]
      : req.params.sessionId

    if (!sessionId) {
      throw new ApiError(400, 'Session id is required', 'SESSION_ID_REQUIRED')
    }

    return sessionId
  }
}

export const securityController = new SecurityController(securityService)
