import type { NextFunction, Request, Response } from 'express';
import { sendAdminResult } from '../../shared';
import type { IListAdminAuditLogsUseCase } from '../application/use-cases/list-admin-audit-logs.usecase';
import { adminAuditLogsQuerySchema } from './admin-audit-logs.schema';
export class AdminAuditLogsController {
  constructor(private readonly useCase: IListAdminAuditLogsUseCase) {}
  list = (req: Request, res: Response, next: NextFunction) =>
    sendAdminResult(
      next,
      () => this.useCase.execute(adminAuditLogsQuerySchema.parse(req.query)),
      res,
      'Audit logs fetched'
    );
}
