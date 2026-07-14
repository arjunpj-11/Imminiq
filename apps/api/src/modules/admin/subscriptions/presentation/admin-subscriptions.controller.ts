import type { NextFunction, Request, Response } from 'express';
import { getAdminActor, sendAdminResult } from '../../shared';
import type { IAdminSubscriptionsUseCase } from '../application/admin-subscriptions.usecase';
import {
  adminSubscriptionsQuerySchema,
  adminPlanIdSchema,
  adminPlanLimitsSchema,
} from './admin-subscriptions.schema';

export class AdminSubscriptionsController {
  constructor(private readonly useCase: IAdminSubscriptionsUseCase) {}

  overview = (req: Request, res: Response, next: NextFunction) =>
    sendAdminResult(
      next,
      () => this.useCase.getOverview(adminSubscriptionsQuerySchema.parse(req.query)),
      res,
      'Subscription overview fetched'
    );

  updatePlanLimits = (req: Request, res: Response, next: NextFunction) =>
    sendAdminResult(
      next,
      () =>
        this.useCase.updatePlanLimits(
          adminPlanIdSchema.parse(req.params.planId),
          adminPlanLimitsSchema.parse(req.body),
          getAdminActor(req)
        ),
      res,
      'Subscription plan limits updated'
    );
}
