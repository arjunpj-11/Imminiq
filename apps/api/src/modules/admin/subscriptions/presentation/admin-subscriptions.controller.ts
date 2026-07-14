import type { NextFunction, Request, Response } from 'express';
import { getAdminActor, sendAdminResult } from '../../shared';
import type { AdminSubscriptionsUseCases } from '../application/admin-subscriptions-use-cases.contract';
import {
  adminSubscriptionsQuerySchema,
  adminPlanIdSchema,
  adminPlanLimitsSchema,
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

  updatePlanLimits = (req: Request, res: Response, next: NextFunction) =>
    sendAdminResult(
      next,
      () =>
        this.useCases.updatePlanLimits.execute(
          adminPlanIdSchema.parse(req.params.planId),
          adminPlanLimitsSchema.parse(req.body),
          getAdminActor(req)
        ),
      res,
      'Subscription plan limits updated'
    );
}
