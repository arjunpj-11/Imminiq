import type { NextFunction, Request, Response } from 'express';
import { sendAdminResult } from '../../shared';
import type { AdminAuditLogsUseCases } from '../application/admin-audit-logs-use-cases.contract';
import { adminAuditLogsQuerySchema } from './admin-audit-logs.schema';
export class AdminAuditLogsController {
  constructor(private readonly useCases: AdminAuditLogsUseCases) {}
  list = (req: Request, res: Response, next: NextFunction) =>
    sendAdminResult(
      next,
      () => this.useCases.list.execute(adminAuditLogsQuerySchema.parse(req.query)),
      res,
      'Audit logs fetched'
    );
}
