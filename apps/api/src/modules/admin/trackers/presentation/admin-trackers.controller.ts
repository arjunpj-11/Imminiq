import type { NextFunction, Request, Response } from 'express';
import { getAdminActor, sendAdminResult } from '../../shared';
import type { IAdminTrackersUseCase } from '../application/use-cases/admin-trackers.usecase';
import {
  adminPublishedTrackerRatingSchema,
  adminTrackersQuerySchema,
} from './admin-trackers.schema';
export class AdminTrackersController {
  constructor(private readonly useCase: IAdminTrackersUseCase) {}
  list = (req: Request, res: Response, next: NextFunction) =>
    sendAdminResult(
      next,
      () => this.useCase.list(adminTrackersQuerySchema.parse(req.query)),
      res,
      'Trackers fetched'
    );
  listPublished = (req: Request, res: Response, next: NextFunction) =>
    sendAdminResult(
      next,
      () => this.useCase.listPublished(adminTrackersQuerySchema.parse(req.query), getAdminActor(req)),
      res,
      'Published trackers fetched'
    );
  likePublished = (req: Request, res: Response, next: NextFunction) =>
    sendAdminResult(
      next,
      () => this.useCase.likePublished(String(req.params.id), getAdminActor(req)),
      res,
      'Published tracker liked'
    );
  ratePublished = (req: Request, res: Response, next: NextFunction) => {
    const input = adminPublishedTrackerRatingSchema.parse(req.body);
    return sendAdminResult(
      next,
      () => this.useCase.ratePublished(String(req.params.id), input.rating, getAdminActor(req)),
      res,
      'Published tracker rated'
    );
  };
  getDetail = (req: Request, res: Response, next: NextFunction) =>
    sendAdminResult(
      next,
      () => this.useCase.getDetail(String(req.params.id)),
      res,
      'Tracker fetched'
    );
  delete = (req: Request, res: Response, next: NextFunction) =>
    sendAdminResult(
      next,
      () => this.useCase.delete(String(req.params.id), getAdminActor(req)),
      res,
      'Tracker deleted and owner notified'
    );
}
