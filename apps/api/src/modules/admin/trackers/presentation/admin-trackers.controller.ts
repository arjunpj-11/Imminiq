import type { NextFunction, Request, Response } from 'express';
import { getAdminActor, sendAdminResult } from '../../shared/presentation';
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
  constructor(private readonly useCases: AdminTrackersUseCases) {}
  exportCsv = async (req: Request, res: Response, next: NextFunction) => { try { const query = adminTrackersQuerySchema.parse(req.query); const content = await this.useCases.exports.trackers({ search: query.search ?? '', status: query.status ?? 'all' }); res.setHeader('Content-Type', 'text/csv; charset=utf-8'); res.setHeader('Content-Disposition', 'attachment; filename="imminiq-trackers.csv"'); res.send(`\uFEFF${content}`); } catch (error) { next(error); } };
  bulkLifecycle = async (req: Request, res: Response, next: NextFunction) => { try { const input = adminTrackerBulkLifecycleSchema.parse(req.body); if (input.preview) { const candidates = await Promise.all(input.ids.map(async (id) => ({ id, exists: Boolean(await this.useCases.getDetail.execute(id).catch(() => null)) }))); return res.json({ success: true, message: 'Bulk action preview', data: { requested: input.ids.length, eligible: candidates.filter((item) => item.exists).map((item) => item.id), blocked: candidates.filter((item) => !item.exists).map((item) => ({ id: item.id, reason: 'not_found' })) } }); } const { ids, preview: _preview, ...lifecycle } = input; const actor = getAdminActor(req); const settled = await Promise.allSettled(ids.map((id) => this.useCases.updateLifecycle.execute(id, lifecycle, actor))); const results = settled.map((result, index) => result.status === 'fulfilled' ? { id: ids[index], success: true } : { id: ids[index], success: false, error: result.reason instanceof Error ? result.reason.message : 'Failed' }); return res.json({ success: true, message: 'Bulk tracker action completed', data: { succeeded: results.filter((item) => item.success).length, failed: results.filter((item) => !item.success).length, results } }); } catch (error) { return next(error); } };
  listAppeals = (req: Request, res: Response, next: NextFunction) => sendAdminResult(next, () => this.useCases.contentAppeals.list('tracker', adminContentAppealsQuerySchema.parse(req.query)), res, 'Tracker appeals fetched');
  updateAppeal = (req: Request, res: Response, next: NextFunction) => sendAdminResult(next, () => this.useCases.contentAppeals.update('tracker', String(req.params.appealId), adminContentAppealUpdateSchema.parse(req.body), getAdminActor(req)), res, 'Tracker appeal updated');
  listVersions = (req: Request, res: Response, next: NextFunction) => sendAdminResult(next, () => this.useCases.versions.list(String(req.params.id)), res, 'Tracker versions fetched');
  restoreVersion = (req: Request, res: Response, next: NextFunction) => sendAdminResult(next, () => this.useCases.versions.restore(String(req.params.id), adminTrackerVersionParamSchema.parse(req.params.version), adminTrackerVersionRestoreSchema.parse(req.body).reason, getAdminActor(req)), res, 'Tracker version restored');
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
  listReviews = (req: Request, res: Response, next: NextFunction) =>
    sendAdminResult(
      next,
      () => this.useCases.reviews.list.execute(adminTrackersQuerySchema.parse(req.query)),
      res,
      'Tracker reviews fetched'
    );
  addReviewConsensus = (req: Request, res: Response, next: NextFunction) => {
    const input = adminTrackerReviewConsensusSchema.parse(req.body);
    return sendAdminResult(
      next,
      () =>
        this.useCases.reviews.addConsensus.execute(
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
        this.useCases.reviews.resolve.execute(
          String(req.params.reviewId),
          input.status,
          getAdminActor(req)
        ),
      res,
      'Tracker review resolved'
    );
  };
}
