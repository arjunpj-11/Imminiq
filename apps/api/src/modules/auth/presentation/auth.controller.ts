import type {
  CookieOptions,
  Request,
  Response,
  NextFunction,
} from 'express'

import { authService } from '../auth.service'
import { ApiResponse } from '../../../shared/utils/ApiResponse'
import { ApiError } from '../../../shared/utils/ApiError'
import { env } from '../../../config/env'
import { getAuthUser } from '../../../shared/utils/getAuthUser'
import {
  clearCsrfCookie,
  setCsrfCookie,
} from '../../../shared/middlewares/csrf-token.middleware'
import {
  decryptAuthCookieToken,
  encryptAuthCookieToken,
} from '../../../shared/security/auth-cookie-token.util'
import type { OAuthLoginUser } from '../auth.service'

const REFRESH_COOKIE_NAME = 'refreshToken'
const TWO_FACTOR_CHALLENGE_COOKIE_NAME = 'twoFactorChallengeToken'

const AUTH_COOKIE_PATH = '/api/auth'

const isProduction = env.NODE_ENV === 'production'

const CROSS_SITE_COOKIE_OPTIONS: Pick<
  CookieOptions,
  'secure' | 'sameSite' | 'path'
> = {
  secure: isProduction,
  sameSite: isProduction ? 'none' : 'lax',
  path: AUTH_COOKIE_PATH,
}

const COOKIE_OPTIONS: CookieOptions = {
  httpOnly: true,
  ...CROSS_SITE_COOKIE_OPTIONS,
  maxAge: 7 * 24 * 60 * 60 * 1000,
}

const TWO_FACTOR_COOKIE_OPTIONS: CookieOptions = {
  httpOnly: true,
  ...CROSS_SITE_COOKIE_OPTIONS,
  maxAge: 5 * 60 * 1000,
}

const LEGACY_ROOT_COOKIE_OPTIONS: CookieOptions = {
  ...COOKIE_OPTIONS,
  path: '/',
}

const LEGACY_ROOT_TWO_FACTOR_COOKIE_OPTIONS: CookieOptions = {
  ...TWO_FACTOR_COOKIE_OPTIONS,
  path: '/',
}

const getRequestMeta = (req: Request) => ({
  device: req.headers['sec-ch-ua-platform']?.toString(),
  userAgent: req.headers['user-agent'],
  ipAddress: req.ip,
})

const getAuthErrorCode = (error: unknown) => {
  const authError = error as {
    code?: string
    errorCode?: string
  }

  return authError.code || authError.errorCode
}

const isRestrictedAccountCode = (code?: string) => {
  return (
    code === 'ACCOUNT_BLOCKED' ||
    code === 'ACCOUNT_BANNED' ||
    code === 'ACCOUNT_DEACTIVATED' ||
    code === 'ACCOUNT_PAUSED'
  )
}

const clearAuthCookies = (res: Response) => {
  res
    // Current scoped cookies
    .clearCookie(REFRESH_COOKIE_NAME, COOKIE_OPTIONS)
    .clearCookie(
      TWO_FACTOR_CHALLENGE_COOKIE_NAME,
      TWO_FACTOR_COOKIE_OPTIONS
    )

    // Old cookies that were previously created with Path=/
    .clearCookie(REFRESH_COOKIE_NAME, LEGACY_ROOT_COOKIE_OPTIONS)
    .clearCookie(
      TWO_FACTOR_CHALLENGE_COOKIE_NAME,
      LEGACY_ROOT_TWO_FACTOR_COOKIE_OPTIONS
    )

  clearCsrfCookie(res)
}

const setRefreshSessionCookies = (
  res: Response,
  rawRefreshToken: string
): void => {
  res.cookie(
    REFRESH_COOKIE_NAME,
    encryptAuthCookieToken(rawRefreshToken),
    COOKIE_OPTIONS
  )

  setCsrfCookie(res)
}

const setTwoFactorChallengeCookies = (
  res: Response,
  rawChallengeToken: string
): void => {
  res.cookie(
    TWO_FACTOR_CHALLENGE_COOKIE_NAME,
    encryptAuthCookieToken(rawChallengeToken),
    TWO_FACTOR_COOKIE_OPTIONS
  )

  setCsrfCookie(res)
}

const decryptRequiredCookie = (
  req: Request,
  cookieName: string,
  missingMessage: string,
  missingCode: string,
  invalidMessage: string,
  invalidCode: string
): string => {
  const encryptedCookieValue = req.cookies?.[cookieName]

  if (typeof encryptedCookieValue !== 'string') {
    throw new ApiError(
      401,
      missingMessage,
      missingCode
    )
  }

  try {
    return decryptAuthCookieToken(encryptedCookieValue)
  } catch {
    throw new ApiError(
      401,
      invalidMessage,
      invalidCode
    )
  }
}

export const authController = {
  register: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await authService.register(req.body)

      res.status(201).json(
        new ApiResponse('Account created. Please verify your account.', result)
      )
    } catch (error) {
      next(error)
    }
  },

  login: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await authService.login(
        req.body,
        getRequestMeta(req)
      )

      if (result.requiresTwoFactor) {
        setTwoFactorChallengeCookies(
          res,
          result.challengeToken
        )

        res.json(
          new ApiResponse('Two-factor verification required', {
            requiresTwoFactor: true,
            challengeExpiresInMinutes:
              result.challengeExpiresInMinutes,
          })
        )

        return
      }

      setRefreshSessionCookies(
        res,
        result.tokens.refreshToken
      )

      res.json(
        new ApiResponse('Login successful', {
          accessToken: result.tokens.accessToken,
          user: result.user,
          redirectPath: result.redirectPath,
        })
      )
    } catch (error) {
      const errorCode = getAuthErrorCode(error)

      if (isRestrictedAccountCode(errorCode)) {
        clearAuthCookies(res)
      }

      next(error)
    }
  },

  verifyTwoFactorLogin: async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const challengeToken =
        decryptRequiredCookie(
          req,
          TWO_FACTOR_CHALLENGE_COOKIE_NAME,
          'Two-factor challenge is missing. Please sign in again.',
          'TWO_FACTOR_CHALLENGE_MISSING',
          'Two-factor challenge is invalid. Please sign in again.',
          'TWO_FACTOR_CHALLENGE_INVALID'
        )

      const result = await authService.verifyTwoFactorLogin(
        challengeToken,
        req.body,
        getRequestMeta(req)
      )

      setRefreshSessionCookies(
        res,
        result.tokens.refreshToken
      )

      res
        .clearCookie(
          TWO_FACTOR_CHALLENGE_COOKIE_NAME,
          TWO_FACTOR_COOKIE_OPTIONS
        )
        .clearCookie(
          TWO_FACTOR_CHALLENGE_COOKIE_NAME,
          LEGACY_ROOT_TWO_FACTOR_COOKIE_OPTIONS
        )
        .json(
          new ApiResponse('Two-factor verification successful', {
            accessToken: result.tokens.accessToken,
            user: result.user,
            redirectPath: result.redirectPath,
          })
        )
    } catch (error) {
      const errorCode = getAuthErrorCode(error)

      if (isRestrictedAccountCode(errorCode)) {
        clearAuthCookies(res)
      }

      next(error)
    }
  },

  logout: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const encryptedRefreshToken =
        req.cookies?.[REFRESH_COOKIE_NAME]

      if (typeof encryptedRefreshToken === 'string') {
        try {
          const refreshToken =
            decryptAuthCookieToken(encryptedRefreshToken)

          await authService.logout(refreshToken)
        } catch {
          // Invalid or stale encrypted cookies should still be cleared.
        }
      }

      clearAuthCookies(res)

      res.json(new ApiResponse('Logged out successfully'))
    } catch (error) {
      next(error)
    }
  },

  logoutAll: async (req: Request, res: Response, next: NextFunction) => {
    try {
      await authService.logoutAll(getAuthUser(req).userId)

      clearAuthCookies(res)

      res.json(new ApiResponse('Logged out from all devices'))
    } catch (error) {
      next(error)
    }
  },

  refreshToken: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const refreshToken =
        decryptRequiredCookie(
          req,
          REFRESH_COOKIE_NAME,
          'No refresh token',
          'NO_REFRESH_TOKEN',
          'Refresh token cookie is invalid',
          'INVALID_REFRESH_COOKIE'
        )

      const tokens = await authService.refreshTokens(
        refreshToken,
        getRequestMeta(req)
      )

      setRefreshSessionCookies(
        res,
        tokens.refreshToken
      )

      res.json(
        new ApiResponse('Token refreshed', {
          accessToken: tokens.accessToken,
        })
      )
    } catch (error) {
      const errorCode = getAuthErrorCode(error)

      if (isRestrictedAccountCode(errorCode)) {
        clearAuthCookies(res)
      }

      next(error)
    }
  },

  getMe: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = await authService.getMe(getAuthUser(req).userId)

      res.json(new ApiResponse('User fetched', { user }))
    } catch (error) {
      next(error)
    }
  },

  verifyAccount: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { identifier, otp } = req.body

      await authService.verifyAccount(identifier, otp)

      res.json(new ApiResponse('Account verified successfully'))
    } catch (error) {
      next(error)
    }
  },

  sendOtp: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { identifier, purpose } = req.body

      await authService.resendOtp(identifier, purpose)

      res.json(new ApiResponse('OTP sent successfully'))
    } catch (error) {
      next(error)
    }
  },

  forgotPassword: async (req: Request, res: Response, next: NextFunction) => {
    try {
      await authService.forgotPassword(req.body.identifier)

      res.json(
        new ApiResponse('If this account exists, a reset code has been sent')
      )
    } catch (error) {
      next(error)
    }
  },

  verifyResetCode: async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { identifier, otp } = req.body

      const result = await authService.verifyResetCode(identifier, otp)

      res.json(new ApiResponse('Code verified', result))
    } catch (error) {
      next(error)
    }
  },

  resetPassword: async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { resetToken, newPassword } = req.body

      await authService.resetPassword(resetToken, newPassword)

      res.json(new ApiResponse('Password reset successfully'))
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
      const { currentPassword, newPassword } = req.body

      await authService.changePassword(
        getAuthUser(req).userId,
        currentPassword,
        newPassword
      )

      res.json(new ApiResponse('Password changed successfully'))
    } catch (error) {
      next(error)
    }
  },

  checkIdentifier: async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const result = await authService.checkIdentifier(req.body.identifier)

      res.json(new ApiResponse('Identifier checked', result))
    } catch (error) {
      next(error)
    }
  },

  checkUsername: async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const result = await authService.checkUsername(req.body.username)

      res.json(new ApiResponse('Username checked', result))
    } catch (error) {
      next(error)
    }
  },

  getSessions: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const sessions = await authService.getSessions(getAuthUser(req).userId)

      res.json(new ApiResponse('Sessions fetched', { sessions }))
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
      const user = getAuthUser(req)
      const { sessionId } = req.params

      if (!sessionId || Array.isArray(sessionId)) {
        throw new ApiError(
          400,
          'Session ID is required',
          'SESSION_ID_REQUIRED'
        )
      }

      await authService.revokeSession(user.userId, sessionId)

      res.json(new ApiResponse('Session revoked'))
    } catch (error) {
      next(error)
    }
  },

  oauthCallback: async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      if (!req.user) {
        throw new ApiError(
          401,
          'OAuth authentication failed',
          'OAUTH_USER_MISSING'
        )
      }

      const result = await authService.handleOAuthLogin(
        req.user as unknown as OAuthLoginUser,
        getRequestMeta(req)
      )

      if (result.requiresTwoFactor) {
        setTwoFactorChallengeCookies(
          res,
          result.challengeToken
        )

        res.redirect(`${env.CLIENT_URL}/two-factor-challenge`)
        return
      }

      setRefreshSessionCookies(
        res,
        result.tokens.refreshToken
      )

      res.redirect(`${env.CLIENT_URL}${result.redirectPath}`)
    } catch (error) {
      const errorCode = getAuthErrorCode(error)

      if (isRestrictedAccountCode(errorCode)) {
        clearAuthCookies(res)
        res.redirect(`${env.CLIENT_URL}/blocked`)
        return
      }

      next(error)
    }
  },
}