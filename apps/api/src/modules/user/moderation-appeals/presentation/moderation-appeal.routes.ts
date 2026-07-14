import { Router } from 'express';

import { validate } from '../../../../shared/middlewares/validate';
import { authenticateModerationAppeal } from '../../../../shared/middlewares/moderation-appeal-auth.middleware';
import { moderationAppealIpLimiter } from '../../../../shared/middlewares/security-rate-limit.middleware';
import { ModerationAppealController } from './moderation-appeal.controller';
import type { ModerationAppealUseCases } from '../application/moderation-appeal-use-cases.contract';
import { MODERATION_APPEAL_ROUTE_PATHS } from './moderation-appeal.route.constants';
import {
  getModerationAppealStatusSchema,
  submitModerationAppealSchema,
} from './moderation-appeal.schema';

export const createModerationAppealRoutes = (useCases: ModerationAppealUseCases) => {
const moderationAppealController = new ModerationAppealController(useCases);
const router = Router();
router.use(moderationAppealIpLimiter, authenticateModerationAppeal);

// ─── PUBLIC ──────────────────────────────────────────────────

router.post(
  MODERATION_APPEAL_ROUTE_PATHS.ROOT,
  validate(submitModerationAppealSchema),
  moderationAppealController.submitAppeal
);

router.post(
  MODERATION_APPEAL_ROUTE_PATHS.STATUS,
  validate(getModerationAppealStatusSchema),
  moderationAppealController.getAppealStatus
);

  return router;
};
