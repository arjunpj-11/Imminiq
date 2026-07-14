import { Router } from 'express';

import { authenticate } from '../../../shared/middlewares/auth.middleware';
import {
  publicEmailChangeVerifyIpLimiter,
  securityTwoFactorIpLimiter,
} from '../../../shared/middlewares/security-rate-limit.middleware';
import { validate, validateIdentifierParam } from '../../../shared/middlewares/validate';
import { SecurityController } from './security.controller';
import type { SecurityUseCases } from '../application/security-use-cases.contract';
import { SECURITY_ROUTE_PATHS } from './security.route.constants';
import {
  changeEmailSchema,
  changePasswordSchema,
  deleteAccountSchema,
  disableTwoFactorSchema,
  verifyEmailChangeSchema,
  verifyTwoFactorSetupSchema,
} from './security.schema';

export const createSecurityRoutes = (useCases: SecurityUseCases) => {
const securityController = new SecurityController(useCases);
const router = Router();
router.param('sessionId', validateIdentifierParam);

// ─── PUBLIC ──────────────────────────────────────────────────

router.post(
  SECURITY_ROUTE_PATHS.VERIFY_EMAIL_CHANGE,
  publicEmailChangeVerifyIpLimiter,
  validate(verifyEmailChangeSchema),
  securityController.verifyEmailChange
);

// ─── PROTECTED ───────────────────────────────────────────────

router.use(authenticate);

router.get(SECURITY_ROUTE_PATHS.OVERVIEW, securityController.getOverview);

router.patch(
  SECURITY_ROUTE_PATHS.CHANGE_EMAIL,
  validate(changeEmailSchema),
  securityController.requestEmailChange
);

router.patch(
  SECURITY_ROUTE_PATHS.CHANGE_PASSWORD,
  validate(changePasswordSchema),
  securityController.changePassword
);

router.delete(SECURITY_ROUTE_PATHS.SESSION_BY_ID, securityController.revokeSession);

router.post(SECURITY_ROUTE_PATHS.TWO_FACTOR_SETUP, securityController.setupTwoFactor);

router.post(
  SECURITY_ROUTE_PATHS.TWO_FACTOR_VERIFY,
  securityTwoFactorIpLimiter,
  validate(verifyTwoFactorSetupSchema),
  securityController.verifyTwoFactorSetup
);

router.post(
  SECURITY_ROUTE_PATHS.TWO_FACTOR_DISABLE,
  securityTwoFactorIpLimiter,
  validate(disableTwoFactorSchema),
  securityController.disableTwoFactor
);

router.delete(
  SECURITY_ROUTE_PATHS.DELETE_ACCOUNT,
  validate(deleteAccountSchema),
  securityController.deleteAccount
);

  return router;
};
