import type { NextFunction, Request, Response } from 'express';
import { getAdminActor, sendAdminResult } from '../../shared/presentation';
import type { AdminTrackersUseCases } from '../application/admin-trackers-use-cases.contract';
import {
  adminPublishedTrackerRatingSchema,
  adminTrackersQuerySchema,
} from './admin-trackers.schema';
export class AdminTrackersController {
  constructor(private readonly useCases: AdminTrackersUseCases) {}
  list = (req: Request, res: Response, next: NextFunction) =>
    sendAdminResult(
      next,
      () => this.useCases.list.execute(adminTrackersQuerySchema.parse(req.query)),
      res,
      'Trackers fetched'
    );
  listPublished = (req: Request, res: Response, next: NextFunction) =>
    sendAdminResult(
      next,
      () =>
        this.useCases.listPublished.execute(
          adminTrackersQuerySchema.parse(req.query),
          getAdminActor(req)
        ),
      res,
      'Published trackers fetched'
    );
  likePublished = (req: Request, res: Response, next: NextFunction) =>
    sendAdminResult(
      next,
      () => this.useCases.likePublished.execute(String(req.params.id), getAdminActor(req)),
      res,
      'Published tracker liked'
    );
  ratePublished = (req: Request, res: Response, next: NextFunction) => {
    const input = adminPublishedTrackerRatingSchema.parse(req.body);
    return sendAdminResult(
      next,
      () =>
        this.useCases.ratePublished.execute(
          String(req.params.id),
          input.rating,
          getAdminActor(req)
        ),
      res,
      'Published tracker rated'
    );
  };
  getDetail = (req: Request, res: Response, next: NextFunction) =>
    sendAdminResult(
      next,
      () => this.useCases.getDetail.execute(String(req.params.id)),
      res,
      'Tracker fetched'
    );
  delete = (req: Request, res: Response, next: NextFunction) =>
    sendAdminResult(
      next,
      () => this.useCases.delete.execute(String(req.params.id), getAdminActor(req)),
      res,
      'Tracker deleted and owner notified'
    );
}
