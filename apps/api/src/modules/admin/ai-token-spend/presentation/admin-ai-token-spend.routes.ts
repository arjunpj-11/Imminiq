import { Router } from 'express';

import { authenticate } from '../../../../shared/middlewares/auth.middleware';
import { requireAdmin } from '../../../../shared/middlewares/admin.middleware';
import type { AdminAITokenSpendUseCases } from '../application/admin-ai-token-spend-use-cases.contract';
import { AdminAITokenSpendController } from './admin-ai-token-spend.controller';
import { ADMIN_AI_TOKEN_SPEND_ROUTE_PATHS } from './admin-ai-token-spend.route.constants';

export const createAdminAITokenSpendRoutes = (useCases: AdminAITokenSpendUseCases) => {
  const router = Router();
  const controller = new AdminAITokenSpendController(useCases);

  router.use(authenticate, requireAdmin);
  router.get(ADMIN_AI_TOKEN_SPEND_ROUTE_PATHS.ROOT, controller.get);

  return router;
};
