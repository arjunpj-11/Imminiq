import { Router } from 'express';
import { authenticate } from '../../../../shared/middlewares/auth.middleware';
import type { ISubscriptionsUseCase } from '../application/subscriptions.usecase';
import { SubscriptionsController } from './subscriptions.controller';

export const createSubscriptionsRoutes = (useCase: ISubscriptionsUseCase) => {
  const router = Router();
  const controller = new SubscriptionsController(useCase);
  router.get('/plans', controller.listPlans);
  router.use(authenticate);
  router.get('/me', controller.getMine);
  router.post('/orders', controller.createOrder);
  router.post('/verify', controller.verifyPayment);
  return router;
};
