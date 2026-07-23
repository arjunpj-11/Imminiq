import { Router } from 'express';

import { authenticate } from '../../../../shared/middlewares/auth.middleware';
import { authenticatedApiUserLimiter } from '../../../../shared/middlewares/security-rate-limit.middleware';
import type { CallsUseCases } from '../application/calls-use-cases.contract';
import { CallsController } from './calls.controller';
import { CALLS_ROUTE_PATHS } from './calls.route.constants';

export const createCallsRoutes = (useCases: CallsUseCases) => {
  const router = Router();
  const controller = new CallsController(useCases);

  router.use(authenticate, authenticatedApiUserLimiter);
  router.get(CALLS_ROUTE_PATHS.ACTIVE, controller.getActive);
  router.get(CALLS_ROUTE_PATHS.ROOT, controller.list);
  router.post(CALLS_ROUTE_PATHS.ROOT, controller.initiate);
  router.patch(CALLS_ROUTE_PATHS.RESPOND, controller.respond);
  router.patch(CALLS_ROUTE_PATHS.END, controller.end);

  return router;
};
