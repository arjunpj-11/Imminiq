import { Router } from 'express';

import { authenticate } from '../../../../shared/middlewares/auth.middleware';
import { requireAdmin } from '../../../../shared/middlewares/admin.middleware';
import type { IGetAdminAITokenSpendUseCase } from '../application/use-cases/get-admin-ai-token-spend.usecase';
import { AdminAITokenSpendController } from './admin-ai-token-spend.controller';

export const createAdminAITokenSpendRoutes = (useCase: IGetAdminAITokenSpendUseCase) => {
  const router = Router();
  const controller = new AdminAITokenSpendController(useCase);

  router.use(authenticate, requireAdmin);
  router.get('/', controller.get);

  return router;
};
