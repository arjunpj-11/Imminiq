import { Router } from 'express';
import { authenticate } from '../../../../shared/middlewares/auth.middleware';
import type { SubscriptionsUseCases } from '../application/subscriptions-use-cases.contract';
import { SubscriptionsController } from './subscriptions.controller';

export const createSubscriptionsRoutes = (useCases: SubscriptionsUseCases) => {
  const router = Router();
  const controller = new SubscriptionsController(useCases);
  router.get('/plans', controller.listPlans);
  router.use(authenticate);
  router.get('/me', controller.getMine);
  router.post('/orders', controller.createOrder);
  router.post('/verify', controller.verifyPayment);
  return router;
};
