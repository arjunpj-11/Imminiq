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
  adminQuestionBankDeleteSchema,
  adminQuestionBankRestoreSchema,
  adminQuestionBankIdSchema,
  adminQuestionBankQuerySchema,
} from './admin-mock-tests.schema';
export class AdminMockTestsController {
  constructor(private readonly _useCases: AdminMockTestsUseCases) {}
  exportCsv = async (req: Request, res: Response, next: NextFunction) => { try { const query = adminMockTestsQuerySchema.parse(req.query); const content = await this._useCases.exports.mockTests({ search: query.search ?? '', status: query.status ?? 'all' }); res.setHeader('Content-Type', 'text/csv; charset=utf-8'); res.setHeader('Content-Disposition', 'attachment; filename="imminiq-mock-tests.csv"'); res.send(`\uFEFF${content}`); } catch (error) { next(error); } };
  bulkLifecycle = (req: Request, res: Response, next: NextFunction) => {
    const input = adminMockTestBulkLifecycleSchema.parse(req.body);
    return sendAdminResult(
      next,
      () => this._useCases.bulkUpdateLifecycle.execute(input, getAdminActor(req)),
      res,
      input.preview ? 'Bulk action preview' : 'Bulk mock test action completed'
    );
  };
  listAppeals = (req: Request, res: Response, next: NextFunction) =>
    sendAdminResult(next, () => this._useCases.contentAppeals.list('mock_test', adminContentAppealsQuerySchema.parse(req.query)), res, 'Mock test appeals fetched');
  updateAppeal = (req: Request, res: Response, next: NextFunction) =>
    sendAdminResult(next, () => this._useCases.contentAppeals.update('mock_test', String(req.params.appealId), adminContentAppealUpdateSchema.parse(req.body), getAdminActor(req)), res, 'Mock test appeal updated');
  list = (req: Request, res: Response, next: NextFunction) =>
    sendAdminResult(
      next,
      () => this._useCases.list.execute(adminMockTestsQuerySchema.parse(req.query)),
      res,
      'Mock tests fetched'
    );
  getDetail = (req: Request, res: Response, next: NextFunction) =>
    sendAdminResult(
      next,
      () => this._useCases.getDetail.execute(String(req.params.id)),
      res,
      'Mock test fetched'
    );

  listQuestionIssues = (req: Request, res: Response, next: NextFunction) =>
    sendAdminResult(
      next,
      () => this._useCases.listQuestionIssues.execute(adminMockTestsQuerySchema.parse(req.query)),
      res,
      'Mock test question reports fetched'
    );

  listQuestionBank = (req: Request, res: Response, next: NextFunction) =>
    sendAdminResult(
      next,
      () => this._useCases.questionBank.list(adminQuestionBankQuerySchema.parse(req.query)),
      res,
      'Question bank fetched'
    );

  getQuestionBankItem = (req: Request, res: Response, next: NextFunction) =>
    sendAdminResult(
      next,
      () => this._useCases.questionBank.get(adminQuestionBankIdSchema.parse(req.params.bankId)),
      res,
      'Question bank item fetched'
    );

  deleteQuestionBankItem = (req: Request, res: Response, next: NextFunction) =>
    sendAdminResult(
      next,
      () =>
        this._useCases.questionBank.remove({
          bankId: adminQuestionBankIdSchema.parse(req.params.bankId),
          reason: adminQuestionBankDeleteSchema.parse(req.body).reason,
          actor: getAdminActor(req),
        }),
      res,
      'Question removed from the bank and active mock tests'
    );

  restoreQuestionBankItem = (req: Request, res: Response, next: NextFunction) =>
    sendAdminResult(
      next,
      () =>
        this._useCases.questionBank.restore({
          bankId: adminQuestionBankIdSchema.parse(req.params.bankId),
          reason: adminQuestionBankRestoreSchema.parse(req.body).reason,
          actor: getAdminActor(req),
        }),
      res,
      'Question restored in the bank and linked mock tests'
    );

  updateQuestionIssue = (req: Request, res: Response, next: NextFunction) =>
    sendAdminResult(
      next,
      () =>
        this._useCases.updateQuestionIssue.execute(
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
        this._useCases.updateLifecycle.execute(
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
      () => this._useCases.questionVersions.list(String(req.params.questionId)),
      res,
      'Question versions fetched'
    );

  restoreQuestionVersion = (req: Request, res: Response, next: NextFunction) =>
    sendAdminResult(
      next,
      () =>
        this._useCases.questionVersions.restore(
          String(req.params.questionId),
          adminMockTestQuestionVersionParamSchema.parse(req.params.version),
          adminMockTestQuestionVersionRestoreSchema.parse(req.body).reason,
          getAdminActor(req)
        ),
      res,
      'Question version restored'
    );
}
