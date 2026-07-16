import type { NextFunction, Request, Response } from 'express';
import { getAdminActor, sendAdminResult } from '../../shared/presentation';
import type { AdminTrackersUseCases } from '../application/admin-trackers-use-cases.contract';
import {
  adminPublishedTrackerRatingSchema,
  adminTrackerLifecycleSchema,
  adminTrackerReportUpdateSchema,
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
  listReports = (req: Request, res: Response, next: NextFunction) =>
    sendAdminResult(
      next,
      () => this.useCases.listReports.execute(adminTrackersQuerySchema.parse(req.query)),
      res,
      'Tracker reports fetched'
    );
  updateReport = (req: Request, res: Response, next: NextFunction) =>
    sendAdminResult(
      next,
      () =>
        this.useCases.updateReport.execute(
          String(req.params.reportId),
          adminTrackerReportUpdateSchema.parse(req.body),
          getAdminActor(req)
        ),
      res,
      'Tracker report updated'
    );
  updateLifecycle = (req: Request, res: Response, next: NextFunction) =>
    sendAdminResult(
      next,
      () =>
        this.useCases.updateLifecycle.execute(
          String(req.params.id),
          adminTrackerLifecycleSchema.parse(req.body),
          getAdminActor(req)
        ),
      res,
      'Tracker moderation updated'
    );
}
