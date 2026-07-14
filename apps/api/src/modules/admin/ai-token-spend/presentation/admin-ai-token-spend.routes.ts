import { Router } from 'express';

import { authenticate } from '../../../../shared/middlewares/auth.middleware';
import { requireAdmin } from '../../../../shared/middlewares/admin.middleware';
import type { AdminAITokenSpendUseCases } from '../application/admin-ai-token-spend-use-cases.contract';
import { AdminAITokenSpendController } from './admin-ai-token-spend.controller';

export const createAdminAITokenSpendRoutes = (useCases: AdminAITokenSpendUseCases) => {
  const router = Router();
  const controller = new AdminAITokenSpendController(useCases);

  router.use(authenticate, requireAdmin);
  router.get('/', controller.get);

  return router;
};
