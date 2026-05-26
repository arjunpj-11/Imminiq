import type {
  Request,
  Response,
  NextFunction,
} from 'express'

import { ApiResponse } from '../../../shared/utils/ApiResponse'
import { getAuthUser } from '../../../shared/utils/getAuthUser'
import { decryptAuthCookieToken } from '../../../shared/security/auth-cookie-token.util'
import { securityService } from '../security.service'
import { ApiError } from '@/shared/utils/ApiError'

const REFRESH_COOKIE_NAME = 'refreshToken'

const getRawRefreshTokenFromCookie = (
  req: Request
): string | undefined => {
  const encryptedRefreshToken =
    req.cookies?.[REFRESH_COOKIE_NAME]

  if (typeof encryptedRefreshToken !== 'string') {
    return undefined
  }

  try {
    return decryptAuthCookieToken(encryptedRefreshToken)
  } catch {
    return undefined
  }
}

export const securityController = {
  getOverview: async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const userId = getAuthUser(req).userId
      const refreshToken =
        getRawRefreshTokenFromCookie(req)

      const result =
        await securityService.getOverview(
          userId,
          refreshToken
        )

      res.json(
        new ApiResponse(
          'Security overview fetched',
          result
        )
      )
    } catch (error) {
      next(error)
    }
  },

  requestEmailChange: async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const userId = getAuthUser(req).userId

      const result =
        await securityService.requestEmailChange(
          userId,
          req.body
        )

      res.json(
        new ApiResponse(
          'Verification link sent to your new email address',
          result
        )
      )
    } catch (error) {
      next(error)
    }
  },

  verifyEmailChange: async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const result =
        await securityService.verifyEmailChange(req.body)

      res.json(
        new ApiResponse(
          'Email changed successfully. Please sign in again.',
          result
        )
      )
    } catch (error) {
      next(error)
    }
  },

  changePassword: async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const userId = getAuthUser(req).userId

      const result =
        await securityService.changePassword(
          userId,
          req.body
        )

      res.json(
        new ApiResponse(
          'Password changed successfully. Please sign in again.',
          result
        )
      )
    } catch (error) {
      next(error)
    }
  },

  getSessions: async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const userId = getAuthUser(req).userId
      const refreshToken =
        getRawRefreshTokenFromCookie(req)

      const result =
        await securityService.getSessions(
          userId,
          refreshToken
        )

      res.json(
        new ApiResponse(
          'Security sessions fetched',
          result
        )
      )
    } catch (error) {
      next(error)
    }
  },

  revokeSession: async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const userId = getAuthUser(req).userId
      const refreshToken =
        getRawRefreshTokenFromCookie(req)

     const sessionId = Array.isArray(req.params.sessionId)
  ? req.params.sessionId[0]
  : req.params.sessionId

if (!sessionId) {
  throw new ApiError(
    400,
    'Session id is required',
    'SESSION_ID_REQUIRED'
  )
}

const result = await securityService.revokeSession(
  userId,
  sessionId,
  refreshToken
)

      res.json(
        new ApiResponse(
          'Session revoked',
          result
        )
      )
    } catch (error) {
      next(error)
    }
  },

  getTwoFactorStatus: async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const userId = getAuthUser(req).userId

      const result =
        await securityService.getTwoFactorStatus(userId)

      res.json(
        new ApiResponse(
          'Two-factor status fetched',
          result
        )
      )
    } catch (error) {
      next(error)
    }
  },

  setupTwoFactor: async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const userId = getAuthUser(req).userId

      const result =
        await securityService.setupTwoFactor(userId)

      res.json(
        new ApiResponse(
          'Two-factor setup started',
          result
        )
      )
    } catch (error) {
      next(error)
    }
  },

  verifyTwoFactorSetup: async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const userId = getAuthUser(req).userId

      const result =
        await securityService.verifyTwoFactorSetup(
          userId,
          req.body
        )

      res.json(
        new ApiResponse(
          'Two-factor authentication enabled',
          result
        )
      )
    } catch (error) {
      next(error)
    }
  },

  disableTwoFactor: async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const userId = getAuthUser(req).userId

      const result =
        await securityService.disableTwoFactor(
          userId,
          req.body
        )

      res.json(
        new ApiResponse(
          'Two-factor authentication disabled',
          result
        )
      )
    } catch (error) {
      next(error)
    }
  },

  deleteAccount: async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const userId = getAuthUser(req).userId

      const result =
        await securityService.deleteAccount(
          userId,
          req.body
        )

      res.json(
        new ApiResponse(
          'Account deletion scheduled',
          result
        )
      )
    } catch (error) {
      next(error)
    }
  },
}
