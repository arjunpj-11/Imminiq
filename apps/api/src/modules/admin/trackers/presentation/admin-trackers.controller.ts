import type { NextFunction, Request, Response } from 'express';
import { getAdminActor, sendAdminResult } from '../../../../shared/admin';
import type { AdminTrackersUseCases } from '../application/admin-trackers-use-cases.contract';
import {
  adminPublishedTrackerRatingSchema,
  adminTrackerLifecycleSchema,
  adminTrackerReportUpdateSchema,
  adminTrackerReviewConsensusSchema,
  adminTrackerReviewStatusSchema,
  adminTrackersQuerySchema,
  adminContentAppealsQuerySchema,
  adminContentAppealUpdateSchema,
  adminTrackerBulkLifecycleSchema,
  adminTrackerVersionRestoreSchema,
  adminTrackerVersionParamSchema,
} from './admin-trackers.schema';
export class AdminTrackersController {
  constructor(private readonly _useCases: AdminTrackersUseCases) {}
  exportCsv = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const query = adminTrackersQuerySchema.parse(req.query);
      const content = await this._useCases.exports.trackers({
        search: query.search ?? '',
        status: query.status ?? 'all',
      });
      res.setHeader('Content-Type', 'text/csv; charset=utf-8');
      res.setHeader('Content-Disposition', 'attachment; filename="imminiq-trackers.csv"');
      res.send(`\uFEFF${content}`);
    } catch (error) {
      next(error);
    }
  };
  bulkLifecycle = (req: Request, res: Response, next: NextFunction) => {
    const input = adminTrackerBulkLifecycleSchema.parse(req.body);
    return sendAdminResult(
      next,
      () => this._useCases.bulkUpdateLifecycle.execute(input, getAdminActor(req)),
      res,
      input.preview ? 'Bulk action preview' : 'Bulk tracker action completed'
    );
  };
  listAppeals = (req: Request, res: Response, next: NextFunction) =>
    sendAdminResult(
      next,
      () =>
        this._useCases.contentAppeals.list(
          'tracker',
          adminContentAppealsQuerySchema.parse(req.query)
        ),
      res,
      'Tracker appeals fetched'
    );
  updateAppeal = (req: Request, res: Response, next: NextFunction) =>
    sendAdminResult(
      next,
      () =>
        this._useCases.contentAppeals.update(
          'tracker',
          String(req.params.appealId),
          adminContentAppealUpdateSchema.parse(req.body),
          getAdminActor(req)
        ),
      res,
      'Tracker appeal updated'
    );
  listVersions = (req: Request, res: Response, next: NextFunction) =>
    sendAdminResult(
      next,
      () => this._useCases.versions.list(String(req.params.id)),
      res,
      'Tracker versions fetched'
    );
  restoreVersion = (req: Request, res: Response, next: NextFunction) =>
    sendAdminResult(
      next,
      () =>
        this._useCases.versions.restore(
          String(req.params.id),
          adminTrackerVersionParamSchema.parse(req.params.version),
          adminTrackerVersionRestoreSchema.parse(req.body).reason,
          getAdminActor(req)
        ),
      res,
      'Tracker version restored'
    );
  list = (req: Request, res: Response, next: NextFunction) =>
    sendAdminResult(
      next,
      () => this._useCases.list.execute(adminTrackersQuerySchema.parse(req.query)),
      res,
      'Trackers fetched'
    );
  listPublished = (req: Request, res: Response, next: NextFunction) =>
    sendAdminResult(
      next,
      () =>
        this._useCases.listPublished.execute(
          adminTrackersQuerySchema.parse(req.query),
          getAdminActor(req)
        ),
      res,
      'Published trackers fetched'
    );
  likePublished = (req: Request, res: Response, next: NextFunction) =>
    sendAdminResult(
      next,
      () => this._useCases.likePublished.execute(String(req.params.id), getAdminActor(req)),
      res,
      'Published tracker liked'
    );
  ratePublished = (req: Request, res: Response, next: NextFunction) => {
    const input = adminPublishedTrackerRatingSchema.parse(req.body);
    return sendAdminResult(
      next,
      () =>
        this._useCases.ratePublished.execute(
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
      () => this._useCases.getDetail.execute(String(req.params.id)),
      res,
      'Tracker fetched'
    );
  listReports = (req: Request, res: Response, next: NextFunction) =>
    sendAdminResult(
      next,
      () => this._useCases.listReports.execute(adminTrackersQuerySchema.parse(req.query)),
      res,
      'Tracker reports fetched'
    );
  updateReport = (req: Request, res: Response, next: NextFunction) =>
    sendAdminResult(
      next,
      () =>
        this._useCases.updateReport.execute(
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
        this._useCases.updateLifecycle.execute(
          String(req.params.id),
          adminTrackerLifecycleSchema.parse(req.body),
          getAdminActor(req)
        ),
      res,
      'Tracker moderation updated'
    );
  listReviews = (req: Request, res: Response, next: NextFunction) =>
    sendAdminResult(
      next,
      () => this._useCases.reviews.list.execute(adminTrackersQuerySchema.parse(req.query)),
      res,
      'Tracker reviews fetched'
    );
  addReviewConsensus = (req: Request, res: Response, next: NextFunction) => {
    const input = adminTrackerReviewConsensusSchema.parse(req.body);
    return sendAdminResult(
      next,
      () =>
        this._useCases.reviews.addConsensus.execute(
          String(req.params.reviewId),
          input.choice,
          getAdminActor(req)
        ),
      res,
      'Consensus vote added'
    );
  };
  resolveReview = (req: Request, res: Response, next: NextFunction) => {
    const input = adminTrackerReviewStatusSchema.parse(req.body);
    return sendAdminResult(
      next,
      () =>
        this._useCases.reviews.resolve.execute(
          String(req.params.reviewId),
          input.status,
          getAdminActor(req)
        ),
      res,
      'Tracker review resolved'
    );
  };
}
