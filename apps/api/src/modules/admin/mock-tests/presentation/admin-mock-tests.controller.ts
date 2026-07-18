import type { NextFunction, Request, Response } from 'express';
import { getAdminActor, sendAdminResult } from '../../../../shared/admin';
import type { AdminMockTestsUseCases } from '../application/admin-mock-tests-use-cases.contract';
import {
  adminMockTestLifecycleSchema,
  adminMockTestQuestionIssueUpdateSchema,
  adminMockTestsQuerySchema,
  adminMockTestQuestionVersionRestoreSchema,
  adminMockTestQuestionVersionParamSchema,
  adminContentAppealsQuerySchema,
  adminContentAppealUpdateSchema,
  adminMockTestBulkLifecycleSchema,
} from './admin-mock-tests.schema';
export class AdminMockTestsController {
  constructor(private readonly useCases: AdminMockTestsUseCases) {}
  exportCsv = async (req: Request, res: Response, next: NextFunction) => { try { const query = adminMockTestsQuerySchema.parse(req.query); const content = await this.useCases.exports.mockTests({ search: query.search ?? '', status: query.status ?? 'all' }); res.setHeader('Content-Type', 'text/csv; charset=utf-8'); res.setHeader('Content-Disposition', 'attachment; filename="imminiq-mock-tests.csv"'); res.send(`\uFEFF${content}`); } catch (error) { next(error); } };
  bulkLifecycle = async (req: Request, res: Response, next: NextFunction) => { try { const input = adminMockTestBulkLifecycleSchema.parse(req.body); if (input.preview) { const candidates = await Promise.all(input.ids.map(async (id) => ({ id, exists: Boolean(await this.useCases.getDetail.execute(id).catch(() => null)) }))); return res.json({ success: true, message: 'Bulk action preview', data: { requested: input.ids.length, eligible: candidates.filter((item) => item.exists).map((item) => item.id), blocked: candidates.filter((item) => !item.exists).map((item) => ({ id: item.id, reason: 'not_found' })) } }); } const { ids, preview: _preview, ...lifecycle } = input; const actor = getAdminActor(req); const settled = await Promise.allSettled(ids.map((id) => this.useCases.updateLifecycle.execute(id, lifecycle, actor))); const results = settled.map((result, index) => result.status === 'fulfilled' ? { id: ids[index], success: true } : { id: ids[index], success: false, error: result.reason instanceof Error ? result.reason.message : 'Failed' }); return res.json({ success: true, message: 'Bulk mock test action completed', data: { succeeded: results.filter((item) => item.success).length, failed: results.filter((item) => !item.success).length, results } }); } catch (error) { return next(error); } };
  listAppeals = (req: Request, res: Response, next: NextFunction) =>
    sendAdminResult(next, () => this.useCases.contentAppeals.list('mock_test', adminContentAppealsQuerySchema.parse(req.query)), res, 'Mock test appeals fetched');
  updateAppeal = (req: Request, res: Response, next: NextFunction) =>
    sendAdminResult(next, () => this.useCases.contentAppeals.update('mock_test', String(req.params.appealId), adminContentAppealUpdateSchema.parse(req.body), getAdminActor(req)), res, 'Mock test appeal updated');
  list = (req: Request, res: Response, next: NextFunction) =>
    sendAdminResult(
      next,
      () => this.useCases.list.execute(adminMockTestsQuerySchema.parse(req.query)),
      res,
      'Mock tests fetched'
    );
  getDetail = (req: Request, res: Response, next: NextFunction) =>
    sendAdminResult(
      next,
      () => this.useCases.getDetail.execute(String(req.params.id)),
      res,
      'Mock test fetched'
    );

  listQuestionIssues = (req: Request, res: Response, next: NextFunction) =>
    sendAdminResult(
      next,
      () => this.useCases.listQuestionIssues.execute(adminMockTestsQuerySchema.parse(req.query)),
      res,
      'Mock test question reports fetched'
    );

  updateQuestionIssue = (req: Request, res: Response, next: NextFunction) =>
    sendAdminResult(
      next,
      () =>
        this.useCases.updateQuestionIssue.execute(
          String(req.params.issueId),
          adminMockTestQuestionIssueUpdateSchema.parse(req.body),
          getAdminActor(req)
        ),
      res,
      'Mock test question report updated'
    );

  updateLifecycle = (req: Request, res: Response, next: NextFunction) =>
    sendAdminResult(
      next,
      () =>
        this.useCases.updateLifecycle.execute(
          String(req.params.id),
          adminMockTestLifecycleSchema.parse(req.body),
          getAdminActor(req)
        ),
      res,
      'Mock test moderation status updated'
    );

  listQuestionVersions = (req: Request, res: Response, next: NextFunction) =>
    sendAdminResult(
      next,
      () => this.useCases.questionVersions.list(String(req.params.questionId)),
      res,
      'Question versions fetched'
    );

  restoreQuestionVersion = (req: Request, res: Response, next: NextFunction) =>
    sendAdminResult(
      next,
      () =>
        this.useCases.questionVersions.restore(
          String(req.params.questionId),
          adminMockTestQuestionVersionParamSchema.parse(req.params.version),
          adminMockTestQuestionVersionRestoreSchema.parse(req.body).reason,
          getAdminActor(req)
        ),
      res,
      'Question version restored'
    );
}
