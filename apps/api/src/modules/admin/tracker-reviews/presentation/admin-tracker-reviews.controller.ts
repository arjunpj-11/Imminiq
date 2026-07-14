import type { NextFunction, Request, Response } from 'express';
import { getAdminActor, sendAdminResult } from '../../shared/presentation';
import type { AdminTrackerReviewsUseCases } from '../application/admin-tracker-reviews-use-cases.contract';
import {
  adminTrackerReviewConsensusSchema,
  adminTrackerReviewsQuerySchema,
  adminTrackerReviewStatusSchema,
} from './admin-tracker-reviews.schema';
export class AdminTrackerReviewsController {
  constructor(private readonly useCases: AdminTrackerReviewsUseCases) {}
  list = (req: Request, res: Response, next: NextFunction) =>
    sendAdminResult(
      next,
      () => this.useCases.list.execute(adminTrackerReviewsQuerySchema.parse(req.query)),
      res,
      'Tracker reviews fetched'
    );
  resolve = (req: Request, res: Response, next: NextFunction) => {
    const input = adminTrackerReviewStatusSchema.parse(req.body);
    return sendAdminResult(
      next,
      () => this.useCases.resolve.execute(String(req.params.id), input.status, getAdminActor(req)),
      res,
      'Tracker review resolved'
    );
  };
  addConsensusVote = (req: Request, res: Response, next: NextFunction) => {
    const input = adminTrackerReviewConsensusSchema.parse(req.body);
    return sendAdminResult(
      next,
      () =>
        this.useCases.addConsensus.execute(String(req.params.id), input.choice, getAdminActor(req)),
      res,
      'Consensus vote added'
    );
  };
}
