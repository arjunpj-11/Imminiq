import { Router } from 'express'
import passport from 'passport'

import { authController } from './auth.controller'
import { validate } from '../../shared/middlewares/validate'
import { authenticate } from '../../shared/middlewares/auth.middleware'
import { env } from '../../config/env'

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
} from './auth.schema'

const router = Router()

// ─── PUBLIC ROUTES ───────────────────────────────

router.post(
  '/register',
  validate(registerSchema),
  authController.register
)

router.post(
  '/login',
  validate(loginSchema),
  authController.login
)

router.post(
  '/2fa/verify-login',
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
  validate(verifyOtpSchema),
  authController.verifyAccount
)

router.post(
  '/send-otp',
  validate(sendOtpSchema),
  authController.sendOtp
)

router.post(
  '/forgot-password',
  validate(forgotPasswordSchema),
  authController.forgotPassword
)

router.post(
  '/verify-reset-code',
  validate(verifyResetCodeSchema),
  authController.verifyResetCode
)

router.post(
  '/reset-password',
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
  passport.authenticate('google', {
    scope: ['profile', 'email'],
    session: false,
  })
)

router.get(
  '/oauth/google/callback',
  passport.authenticate('google', {
    session: false,
    failureRedirect: `${env.CLIENT_URL}/login?error=oauth_failed`,
  }),
  authController.oauthCallback
)

router.get(
  '/oauth/github',
  passport.authenticate('github', {
    scope: ['user:email'],
    session: false,
  })
)

router.get(
  '/oauth/github/callback',
  passport.authenticate('github', {
    session: false,
    failureRedirect: `${env.CLIENT_URL}/login?error=oauth_failed`,
  }),
  authController.oauthCallback
)

export default router