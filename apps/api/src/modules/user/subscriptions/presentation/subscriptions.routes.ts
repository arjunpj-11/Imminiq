import { Router } from 'express';
import { authenticate } from '../../../../shared/middlewares/auth.middleware';
import type { SubscriptionsUseCases } from '../application/subscriptions-use-cases.contract';
import { SubscriptionsController } from './subscriptions.controller';
import { SUBSCRIPTION_ROUTE_PATHS } from './subscriptions.route.constants';

export const createSubscriptionsRoutes = (useCases: SubscriptionsUseCases) => {
  const router = Router();
  const controller = new SubscriptionsController(useCases);
  router.get(SUBSCRIPTION_ROUTE_PATHS.PLANS, controller.listPlans);
  router.use(authenticate);
  router.get(SUBSCRIPTION_ROUTE_PATHS.CURRENT, controller.getMine);
  router.post(SUBSCRIPTION_ROUTE_PATHS.ORDERS, controller.createOrder);
  router.post(SUBSCRIPTION_ROUTE_PATHS.VERIFY, controller.verifyPayment);
  return router;
};
