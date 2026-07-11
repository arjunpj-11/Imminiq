import { Router } from 'express'

import { authenticate } from '../../../shared/middlewares/auth.middleware'
import {
  publicEmailChangeVerifyIpLimiter,
  securityTwoFactorIpLimiter,
} from '../../../shared/middlewares/security-rate-limit.middleware'
import { validate } from '../../../shared/middlewares/validate'
import { SecurityController } from './security.controller'
import { createSecurityComposition } from '../security.factory'
import { SECURITY_ROUTE_PATHS } from './security.route.constants'
import {
  changeEmailSchema,
  changePasswordSchema,
  deleteAccountSchema,
  disableTwoFactorSchema,
  verifyEmailChangeSchema,
  verifyTwoFactorSetupSchema,
} from './security.schema'

const securityController = new SecurityController(createSecurityComposition().useCases)
const router = Router()

// ─── PUBLIC ──────────────────────────────────────────────────

router.post(
  SECURITY_ROUTE_PATHS.VERIFY_EMAIL_CHANGE,
  publicEmailChangeVerifyIpLimiter,
  validate(verifyEmailChangeSchema),
  securityController.verifyEmailChange
)

// ─── PROTECTED ───────────────────────────────────────────────

router.use(authenticate)

router.get(
  SECURITY_ROUTE_PATHS.OVERVIEW,
  securityController.getOverview
)

router.patch(
  SECURITY_ROUTE_PATHS.CHANGE_EMAIL,
  validate(changeEmailSchema),
  securityController.requestEmailChange
)

router.patch(
  SECURITY_ROUTE_PATHS.CHANGE_PASSWORD,
  validate(changePasswordSchema),
  securityController.changePassword
)

router.get(
  SECURITY_ROUTE_PATHS.SESSIONS,
  securityController.getSessions
)

router.delete(
  SECURITY_ROUTE_PATHS.SESSION_BY_ID,
  securityController.revokeSession
)

router.get(
  SECURITY_ROUTE_PATHS.TWO_FACTOR_STATUS,
  securityController.getTwoFactorStatus
)

router.post(
  SECURITY_ROUTE_PATHS.TWO_FACTOR_SETUP,
  securityController.setupTwoFactor
)

router.post(
  SECURITY_ROUTE_PATHS.TWO_FACTOR_VERIFY,
  securityTwoFactorIpLimiter,
  validate(verifyTwoFactorSetupSchema),
  securityController.verifyTwoFactorSetup
)

router.post(
  SECURITY_ROUTE_PATHS.TWO_FACTOR_DISABLE,
  securityTwoFactorIpLimiter,
  validate(disableTwoFactorSchema),
  securityController.disableTwoFactor
)

router.delete(
  SECURITY_ROUTE_PATHS.DELETE_ACCOUNT,
  validate(deleteAccountSchema),
  securityController.deleteAccount
)

export default router
export { router as securityRoutes }