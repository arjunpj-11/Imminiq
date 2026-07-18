import type { NextFunction, Request, Response } from 'express';
import { getAdminActor, sendAdminResult } from '../../../../shared/admin';
import type { AdminSubscriptionsUseCases } from '../application/admin-subscriptions-use-cases.contract';
import {
  adminSubscriptionsQuerySchema,
  adminPlanIdSchema,
  adminSubscriptionPlanUpdateSchema,
} from './admin-subscriptions.schema';

export class AdminSubscriptionsController {
  constructor(private readonly useCases: AdminSubscriptionsUseCases) {}

  overview = (req: Request, res: Response, next: NextFunction) =>
    sendAdminResult(
      next,
      () => this.useCases.getOverview.execute(adminSubscriptionsQuerySchema.parse(req.query)),
      res,
      'Subscription overview fetched'
    );

  updatePlan = (req: Request, res: Response, next: NextFunction) =>
    sendAdminResult(
      next,
      () =>
        this.useCases.updatePlan.execute(
          adminPlanIdSchema.parse(req.params.planId),
          adminSubscriptionPlanUpdateSchema.parse(req.body),
          getAdminActor(req)
        ),
      res,
      'Subscription plan updated'
    );
}
