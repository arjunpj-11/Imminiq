import type { NextFunction, Request, Response } from 'express';
import { getAdminActor, sendAdminResult } from '../../shared/presentation';
import type { AdminMockTestsUseCases } from '../application/admin-mock-tests-use-cases.contract';
import {
  adminMockTestLifecycleSchema,
  adminMockTestQuestionIssueUpdateSchema,
  adminMockTestsQuerySchema,
} from './admin-mock-tests.schema';
export class AdminMockTestsController {
  constructor(private readonly useCases: AdminMockTestsUseCases) {}
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
}
