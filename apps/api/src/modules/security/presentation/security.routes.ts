import { Router } from 'express'
import { authenticate } from '../../../shared/middlewares/auth.middleware'
import { validate } from '../../../shared/middlewares/validate'
import {
  publicEmailChangeVerifyIpLimiter,
  securityTwoFactorIpLimiter,
} from '../../../shared/middlewares/security-rate-limit.middleware'
import { securityController } from './security.controller'
import {
  changeEmailSchema,
  changePasswordSchema,
  deleteAccountSchema,
  disableTwoFactorSchema,
  verifyEmailChangeSchema,
  verifyTwoFactorSetupSchema,
} from '../security.schema'

const router = Router()

// ─── PUBLIC EMAIL CHANGE VERIFICATION ─────────────
// Must stay before router.use(authenticate)
// because the user clicks this link from their email
// and may not be logged in.
router.post(
  '/verify-email-change',
  publicEmailChangeVerifyIpLimiter,
  validate(verifyEmailChangeSchema),
  securityController.verifyEmailChange
)

// ─── PROTECTED ROUTES ──────────────────────────────
router.use(authenticate)

// ─── OVERVIEW ─────────────────────────────────────
router.get('/overview', securityController.getOverview)

// ─── EMAIL CHANGE REQUEST ─────────────────────────
router.patch(
  '/change-email',
  validate(changeEmailSchema),
  securityController.requestEmailChange
)

// ─── PASSWORD ─────────────────────────────────────
router.patch(
  '/change-password',
  validate(changePasswordSchema),
  securityController.changePassword
)

// ─── SESSIONS ─────────────────────────────────────
router.get('/sessions', securityController.getSessions)

router.delete(
  '/sessions/:sessionId',
  securityController.revokeSession
)

// ─── TWO FACTOR AUTH ──────────────────────────────
router.get(
  '/2fa/status',
  securityController.getTwoFactorStatus
)

router.post(
  '/2fa/setup',
  securityController.setupTwoFactor
)

router.post(
  '/2fa/verify',
  securityTwoFactorIpLimiter,
  validate(verifyTwoFactorSetupSchema),
  securityController.verifyTwoFactorSetup
)

router.post(
  '/2fa/disable',
  securityTwoFactorIpLimiter,
  validate(disableTwoFactorSchema),
  securityController.disableTwoFactor
)

// ─── DELETE ACCOUNT ───────────────────────────────
router.delete(
  '/delete-account',
  validate(deleteAccountSchema),
  securityController.deleteAccount
)

export { router as securityRoutes }
