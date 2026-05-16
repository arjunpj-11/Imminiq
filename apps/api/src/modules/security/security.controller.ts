// apps/api/src/modules/security/security.controller.ts

import type {
  Request,
  Response,
  NextFunction,
} from 'express'

import { ApiResponse } from '../../shared/utils/ApiResponse'
import { ApiError } from '../../shared/utils/ApiError'
import { getAuthUser } from '../../shared/utils/getAuthUser'
import { securityService } from './security.service'

const REFRESH_COOKIE_NAME = 'refreshToken'

export const securityController = {
  // ─── SECURITY OVERVIEW ────────────────────────────

  getOverview: async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const userId = getAuthUser(req).userId
      const refreshToken = req.cookies?.[REFRESH_COOKIE_NAME]

      const result = await securityService.getOverview(
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

  // ─── REQUEST EMAIL CHANGE ─────────────────────────

  requestEmailChange: async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const userId = getAuthUser(req).userId

      const result = await securityService.requestEmailChange(
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

  // ─── VERIFY EMAIL CHANGE LINK ─────────────────────

  verifyEmailChange: async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const result = await securityService.verifyEmailChange(req.body)

      res.json(
        new ApiResponse(
          'Email address verified and updated successfully',
          result
        )
      )
    } catch (error) {
      next(error)
    }
  },

  // ─── CHANGE PASSWORD ──────────────────────────────

  changePassword: async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const userId = getAuthUser(req).userId

      const result = await securityService.changePassword(
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

  // ─── GET ACTIVE SESSIONS ──────────────────────────

  getSessions: async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const userId = getAuthUser(req).userId
      const refreshToken = req.cookies?.[REFRESH_COOKIE_NAME]

      const result = await securityService.getSessions(
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

  // ─── REVOKE SESSION ───────────────────────────────

  revokeSession: async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const userId = getAuthUser(req).userId
      const refreshToken = req.cookies?.[REFRESH_COOKIE_NAME]
      const { sessionId } = req.params

      if (!sessionId || Array.isArray(sessionId)) {
        throw new ApiError(
          400,
          'Session ID is required',
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
          'Session revoked successfully',
          result
        )
      )
    } catch (error) {
      next(error)
    }
  },

  // ─── 2FA STATUS ───────────────────────────────────

  getTwoFactorStatus: async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const userId = getAuthUser(req).userId

      const result = await securityService.getTwoFactorStatus(userId)

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

  // ─── 2FA SETUP ────────────────────────────────────

  setupTwoFactor: async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const userId = getAuthUser(req).userId

      const result = await securityService.setupTwoFactor(userId)

      res.json(
        new ApiResponse(
          'Two-factor setup created',
          result
        )
      )
    } catch (error) {
      next(error)
    }
  },

  // ─── 2FA VERIFY SETUP ─────────────────────────────

  verifyTwoFactorSetup: async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const userId = getAuthUser(req).userId

      const result = await securityService.verifyTwoFactorSetup(
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

  // ─── 2FA DISABLE ──────────────────────────────────

  disableTwoFactor: async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const userId = getAuthUser(req).userId

      const result = await securityService.disableTwoFactor(
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

  // ─── DELETE ACCOUNT ───────────────────────────────

  deleteAccount: async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const userId = getAuthUser(req).userId

      const result = await securityService.deleteAccount(
        userId,
        req.body
      )

      res.json(
        new ApiResponse(
          'Account deleted successfully',
          result
        )
      )
    } catch (error) {
      next(error)
    }
  },
}