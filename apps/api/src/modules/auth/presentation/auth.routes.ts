import { Router } from 'express'
import passport from 'passport'

import { AuthController } from './auth.controller'
import { createAuthComposition } from '../auth.factory'
import { AUTH_ROUTE_PATHS } from './auth.route.constants'
import { validate } from '../../../shared/middlewares/validate'
import { authenticate } from '../../../shared/middlewares/auth.middleware'
import {
  issueOAuthState,
  validateOAuthState,
} from '../../../shared/middlewares/oauth-state.middleware'
import {
  authenticatedApiIpLimiter,
  authOtpSendIpLimiter,
  authOtpVerifyIpLimiter,
  authSessionActionIpLimiter,
  forgotPasswordIpLimiter,
  loginIpLimiter,
  oauthFlowIpLimiter,
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
  verifyOtpSchema,
  sendOtpSchema,
} from './auth.schema'

const authController = new AuthController(createAuthComposition().useCases)
const router = Router()

// ─── PUBLIC ROUTES ───────────────────────────────

router.post(
  AUTH_ROUTE_PATHS.REGISTER,
  registerIpLimiter,
  validate(registerSchema),
  authController.register
)

router.post(
  AUTH_ROUTE_PATHS.LOGIN,
  loginIpLimiter,
  validate(loginSchema),
  authController.login
)

router.post(
  AUTH_ROUTE_PATHS.TWO_FACTOR_VERIFY_LOGIN,
  twoFactorLoginIpLimiter,
  validate(verifyTwoFactorLoginSchema),
  authController.verifyTwoFactorLogin
)

router.post(
  AUTH_ROUTE_PATHS.LOGOUT,
  authSessionActionIpLimiter,
  authController.logout
)

router.post(
  AUTH_ROUTE_PATHS.REFRESH_TOKEN,
  authSessionActionIpLimiter,
  authController.refreshToken
)

router.post(
  AUTH_ROUTE_PATHS.VERIFY_ACCOUNT,
  authOtpVerifyIpLimiter,
  validate(verifyOtpSchema),
  authController.verifyAccount
)

router.post(
  AUTH_ROUTE_PATHS.SEND_OTP,
  authOtpSendIpLimiter,
  validate(sendOtpSchema),
  authController.sendOtp
)

router.post(
  AUTH_ROUTE_PATHS.FORGOT_PASSWORD,
  forgotPasswordIpLimiter,
  validate(forgotPasswordSchema),
  authController.forgotPassword
)

router.post(
  AUTH_ROUTE_PATHS.VERIFY_RESET_CODE,
  authOtpVerifyIpLimiter,
  validate(verifyResetCodeSchema),
  authController.verifyResetCode
)

router.post(
  AUTH_ROUTE_PATHS.RESET_PASSWORD,
  resetPasswordIpLimiter,
  validate(resetPasswordSchema),
  authController.resetPassword
)

// ─── PROTECTED ROUTES ────────────────────────────

router.get(
  AUTH_ROUTE_PATHS.ME,
  authenticatedApiIpLimiter,
  authenticate,
  authController.getMe
)

// ─── OAUTH ROUTES ────────────────────────────────

router.get(
  AUTH_ROUTE_PATHS.OAUTH_GOOGLE,
  oauthFlowIpLimiter,
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
  AUTH_ROUTE_PATHS.OAUTH_GOOGLE_CALLBACK,
  oauthFlowIpLimiter,
  validateOAuthState('google'),
  passport.authenticate('google', {
    session: false,
    failureRedirect: `${env.CLIENT_URL}/login?error=oauth_failed`,
  }),
  authController.oauthCallback
)

router.get(
  AUTH_ROUTE_PATHS.OAUTH_GITHUB,
  oauthFlowIpLimiter,
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
  AUTH_ROUTE_PATHS.OAUTH_GITHUB_CALLBACK,
  oauthFlowIpLimiter,
  validateOAuthState('github'),
  passport.authenticate('github', {
    session: false,
    failureRedirect: `${env.CLIENT_URL}/login?error=oauth_failed`,
  }),
  authController.oauthCallback
)

export default router
export { router as authRoutes }
