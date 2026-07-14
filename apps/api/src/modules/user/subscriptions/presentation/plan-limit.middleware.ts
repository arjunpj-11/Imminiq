import type { NextFunction, Request, Response } from 'express';
import {
  subscriptionLimitService,
  type PlanLimitKind,
} from '../infrastructure/services/subscription-limit.service';

export const enforcePlanLimit = (kind: PlanLimitKind) =>
  async (req: Request, _res: Response, next: NextFunction) => {
    try {
      await subscriptionLimitService.enforce(req.user!.userId, kind, {
        trackerId: Array.isArray(req.params.trackerId) ? req.params.trackerId[0] : req.params.trackerId,
        subtopicId: Array.isArray(req.params.subtopicId) ? req.params.subtopicId[0] : req.params.subtopicId,
      });
      next();
    } catch (error) {
      next(error);
    }
  };
