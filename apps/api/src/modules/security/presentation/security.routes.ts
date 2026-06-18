import { Router } from 'express'

import { authenticate } from '../../../shared/middlewares/auth.middleware'
import {
  publicEmailChangeVerifyIpLimiter,
  securityTwoFactorIpLimiter,
} from '../../../shared/middlewares/security-rate-limit.middleware'
import { validate } from '../../../shared/middlewares/validate'
import { securityController } from './security.controller'
import {
  changeEmailSchema,
  changePasswordSchema,
  deleteAccountSchema,
  disableTwoFactorSchema,
  verifyEmailChangeSchema,
  verifyTwoFactorSetupSchema,
} from './security.schema'

const router = Router()

// ─── PUBLIC ──────────────────────────────────────────────────

router.post(
  '/verify-email-change',
  publicEmailChangeVerifyIpLimiter,
  validate(verifyEmailChangeSchema),
  securityController.verifyEmailChange,
)

// ─── PROTECTED ───────────────────────────────────────────────

router.get('/overview', authenticate, securityController.getOverview)

router.patch(
  '/change-email',
  authenticate,
  validate(changeEmailSchema),
  securityController.requestEmailChange,
)

router.patch(
  '/change-password',
  authenticate,
  validate(changePasswordSchema),
  securityController.changePassword,
)

router.get('/sessions', authenticate, securityController.getSessions)

router.delete(
  '/sessions/:sessionId',
  authenticate,
  securityController.revokeSession,
)

router.get('/2fa/status', authenticate, securityController.getTwoFactorStatus)

router.post('/2fa/setup', authenticate, securityController.setupTwoFactor)

router.post(
  '/2fa/verify',
  authenticate,
  securityTwoFactorIpLimiter,
  validate(verifyTwoFactorSetupSchema),
  securityController.verifyTwoFactorSetup,
)

router.post(
  '/2fa/disable',
  authenticate,
  securityTwoFactorIpLimiter,
  validate(disableTwoFactorSchema),
  securityController.disableTwoFactor,
)

router.delete(
  '/delete-account',
  authenticate,
  validate(deleteAccountSchema),
  securityController.deleteAccount,
)

export default router
export { router as securityRoutes }
