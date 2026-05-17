import { Router } from 'express'
import passport from 'passport'

import { authController } from './auth.controller'
import { validate } from '../../../shared/middlewares/validate'
import { authenticate } from '../../../shared/middlewares/auth.middleware'
import {
  issueOAuthState,
  validateOAuthState,
} from '../../../shared/middlewares/oauth-state.middleware'
import {
  authOtpSendIpLimiter,
  authOtpVerifyIpLimiter,
  forgotPasswordIpLimiter,
  loginIpLimiter,
  registerIpLimiter,
  resetPasswordIpLimiter,
  twoFactorLoginIpLimiter,
} from '../../../shared/middlewares/security-rate-limit.middleware'
import { env } from '../../../config/env'

import {
  registerSchema,
  loginSchema,
  verifyTwoFactorLoginSchema,
  forgotPasswordSchema,
  verifyResetCodeSchema,
  resetPasswordSchema,
  changePasswordSchema,
  verifyOtpSchema,
  sendOtpSchema,
  checkIdentifierSchema,
  checkUsernameSchema,
} from '../auth.schema'

const router = Router()

// ─── PUBLIC ROUTES ───────────────────────────────

router.post(
  '/register',
  registerIpLimiter,
  validate(registerSchema),
  authController.register
)

router.post(
  '/login',
  loginIpLimiter,
  validate(loginSchema),
  authController.login
)

router.post(
  '/2fa/verify-login',
  twoFactorLoginIpLimiter,
  validate(verifyTwoFactorLoginSchema),
  authController.verifyTwoFactorLogin
)

router.post(
  '/logout',
  authController.logout
)

router.post(
  '/refresh-token',
  authController.refreshToken
)

router.post(
  '/verify-account',
  authOtpVerifyIpLimiter,
  validate(verifyOtpSchema),
  authController.verifyAccount
)

router.post(
  '/send-otp',
  authOtpSendIpLimiter,
  validate(sendOtpSchema),
  authController.sendOtp
)

router.post(
  '/forgot-password',
  forgotPasswordIpLimiter,
  validate(forgotPasswordSchema),
  authController.forgotPassword
)

router.post(
  '/verify-reset-code',
  authOtpVerifyIpLimiter,
  validate(verifyResetCodeSchema),
  authController.verifyResetCode
)

router.post(
  '/reset-password',
  resetPasswordIpLimiter,
  validate(resetPasswordSchema),
  authController.resetPassword
)

router.post(
  '/check-identifier',
  validate(checkIdentifierSchema),
  authController.checkIdentifier
)

router.post(
  '/check-username',
  validate(checkUsernameSchema),
  authController.checkUsername
)

// ─── PROTECTED ROUTES ────────────────────────────

router.get(
  '/me',
  authenticate,
  authController.getMe
)

router.post(
  '/change-password',
  authenticate,
  validate(changePasswordSchema),
  authController.changePassword
)

router.get(
  '/sessions',
  authenticate,
  authController.getSessions
)

router.delete(
  '/sessions/:sessionId',
  authenticate,
  authController.revokeSession
)

router.delete(
  '/sessions',
  authenticate,
  authController.logoutAll
)

// ─── OAUTH ROUTES ────────────────────────────────

router.get(
  '/oauth/google',
  issueOAuthState('google'),
  (req, res, next) => {
    passport.authenticate('google', {
      scope: ['profile', 'email'],
      session: false,
      state: String(res.locals.oauthState),
    })(req, res, next)
  }
)

router.get(
  '/oauth/google/callback',
  validateOAuthState('google'),
  passport.authenticate('google', {
    session: false,
    failureRedirect: `${env.CLIENT_URL}/login?error=oauth_failed`,
  }),
  authController.oauthCallback
)

router.get(
  '/oauth/github',
  issueOAuthState('github'),
  (req, res, next) => {
    passport.authenticate('github', {
      scope: ['user:email'],
      session: false,
      state: String(res.locals.oauthState),
    })(req, res, next)
  }
)

router.get(
  '/oauth/github/callback',
  validateOAuthState('github'),
  passport.authenticate('github', {
    session: false,
    failureRedirect: `${env.CLIENT_URL}/login?error=oauth_failed`,
  }),
  authController.oauthCallback
)

export default router
