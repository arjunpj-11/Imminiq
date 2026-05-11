import { Request, Response, NextFunction } from 'express'
import { authService } from './auth.service'
import { ApiResponse } from '../../shared/utils/ApiResponse'
import { ApiError } from '../../shared/utils/ApiError'
import { env } from '../../config/env'

const REFRESH_COOKIE_NAME = 'refreshToken'

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: env.NODE_ENV === 'production',
  sameSite: 'strict' as const,
  maxAge: 7 * 24 * 60 * 60 * 1000,
}

const getRequestMeta = (req: Request) => ({
  device: req.headers['sec-ch-ua-platform']?.toString(),
  userAgent: req.headers['user-agent'],
  ipAddress: req.ip,
})

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
      const { tokens, user } = await authService.login(
        req.body,
        getRequestMeta(req)
      )

      res
        .cookie(REFRESH_COOKIE_NAME, tokens.refreshToken, COOKIE_OPTIONS)
        .json(
          new ApiResponse('Login successful', {
            accessToken: tokens.accessToken,
            user,
          })
        )
    } catch (error) {
      next(error)
    }
  },

  logout: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const refreshToken = req.cookies?.[REFRESH_COOKIE_NAME]

      if (refreshToken) {
        await authService.logout(refreshToken)
      }

      res
        .clearCookie(REFRESH_COOKIE_NAME, COOKIE_OPTIONS)
        .json(new ApiResponse('Logged out successfully'))
    } catch (error) {
      next(error)
    }
  },

  logoutAll: async (req: Request, res: Response, next: NextFunction) => {
    try {
      await authService.logoutAll(req.user.userId)

      res
        .clearCookie(REFRESH_COOKIE_NAME, COOKIE_OPTIONS)
        .json(new ApiResponse('Logged out from all devices'))
    } catch (error) {
      next(error)
    }
  },

  refreshToken: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const refreshToken = req.cookies?.[REFRESH_COOKIE_NAME]

      if (!refreshToken) {
        throw new ApiError(401, 'No refresh token', 'NO_REFRESH_TOKEN')
      }

      const tokens = await authService.refreshTokens(
        refreshToken,
        getRequestMeta(req)
      )

      res
        .cookie(REFRESH_COOKIE_NAME, tokens.refreshToken, COOKIE_OPTIONS)
        .json(
          new ApiResponse('Token refreshed', {
            accessToken: tokens.accessToken,
          })
        )
    } catch (error) {
      next(error)
    }
  },

  getMe: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = await authService.getMe(req.user.userId)

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

 verifyResetCode: async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { identifier, otp } = req.body

    const result = await authService.verifyResetCode(identifier, otp)

    res.json(new ApiResponse('Code verified', result))
  } catch (error) {
    next(error)
  }
},

resetPassword: async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { resetToken, newPassword } = req.body

    await authService.resetPassword(resetToken, newPassword)

    res.json(new ApiResponse('Password reset successfully'))
  } catch (error) {
    next(error)
  }
},
  changePassword: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { currentPassword, newPassword } = req.body

      await authService.changePassword(
        req.user.userId,
        currentPassword,
        newPassword
      )

      res.json(new ApiResponse('Password changed successfully'))
    } catch (error) {
      next(error)
    }
  },

  checkIdentifier: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await authService.checkIdentifier(req.body.identifier)

      res.json(new ApiResponse('Identifier checked', result))
    } catch (error) {
      next(error)
    }
  },

  checkUsername: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await authService.checkUsername(req.body.username)

      res.json(new ApiResponse('Username checked', result))
    } catch (error) {
      next(error)
    }
  },

  getSessions: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const sessions = await authService.getSessions(req.user.userId)

      res.json(new ApiResponse('Sessions fetched', { sessions }))
    } catch (error) {
      next(error)
    }
  },

  revokeSession: async (req: Request, res: Response, next: NextFunction) => {
    try {
      await authService.revokeSession(req.user.userId, req.params.sessionId)

      res.json(new ApiResponse('Session revoked'))
    } catch (error) {
      next(error)
    }
  },

  oauthCallback: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { tokens } = await authService.handleOAuthLogin(
        req.user,
        getRequestMeta(req)
      )

      res
        .cookie(REFRESH_COOKIE_NAME, tokens.refreshToken, COOKIE_OPTIONS)
        .redirect(`${env.CLIENT_URL}/oauth/callback?accessToken=${tokens.accessToken}`)
    } catch (error) {
      next(error)
    }
  },
}