import type { NextFunction, Request, Response } from 'express';
import { sendAdminResult } from '../../shared/presentation';
import type { AdminMockTestsUseCases } from '../application/admin-mock-tests-use-cases.contract';
import { adminMockTestsQuerySchema } from './admin-mock-tests.schema';
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
}
