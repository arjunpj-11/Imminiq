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
} from './security.schema'

const router = Router()

router.post(
  '/verify-email-change',
  publicEmailChangeVerifyIpLimiter,
  validate(verifyEmailChangeSchema),
  securityController.verifyEmailChange
)

router.use(authenticate)

router.get('/overview', securityController.getOverview)

router.patch(
  '/change-email',
  validate(changeEmailSchema),
  securityController.requestEmailChange
)

router.patch(
  '/change-password',
  validate(changePasswordSchema),
  securityController.changePassword
)

router.get('/sessions', securityController.getSessions)

router.delete(
  '/sessions/:sessionId',
  securityController.revokeSession
)

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

router.delete(
  '/delete-account',
  validate(deleteAccountSchema),
  securityController.deleteAccount
)

export { router as securityRoutes }
export default router
