import type { NextFunction, Request, Response } from 'express';
import { getAdminActor, sendAdminResult } from '../../shared';
import type { IAdminTrackerReviewsUseCase } from '../application/use-cases/admin-tracker-reviews.usecase';
import {
  adminTrackerReviewConsensusSchema,
  adminTrackerReviewsQuerySchema,
  adminTrackerReviewStatusSchema,
} from './admin-tracker-reviews.schema';
export class AdminTrackerReviewsController {
  constructor(private readonly useCase: IAdminTrackerReviewsUseCase) {}
  list = (req: Request, res: Response, next: NextFunction) =>
    sendAdminResult(
      next,
      () => this.useCase.list(adminTrackerReviewsQuerySchema.parse(req.query)),
      res,
      'Tracker reviews fetched'
    );
  resolve = (req: Request, res: Response, next: NextFunction) => {
    const input = adminTrackerReviewStatusSchema.parse(req.body);
    return sendAdminResult(
      next,
      () => this.useCase.resolve(String(req.params.id), input.status, getAdminActor(req)),
      res,
      'Tracker review resolved'
    );
  };
  addConsensusVote = (req: Request, res: Response, next: NextFunction) => {
    const input = adminTrackerReviewConsensusSchema.parse(req.body);
    return sendAdminResult(
      next,
      () => this.useCase.addConsensusVote(String(req.params.id), input.choice, getAdminActor(req)),
      res,
      'Consensus vote added'
    );
  };
}
