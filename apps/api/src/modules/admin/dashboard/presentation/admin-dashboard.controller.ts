import type { NextFunction, Request, Response } from 'express';
import type { AdminDashboardUseCases } from '../application/admin-dashboard-use-cases.contract';
import { sendAdminResult } from '../../../../shared/admin';

export class AdminDashboardController {
  constructor(private readonly _useCases: AdminDashboardUseCases) {}

  getOverview = (req: Request, res: Response, next: NextFunction) =>
    sendAdminResult(
      next,
      () =>
        this._useCases.getOverview.execute(
          req.user!.role as 'moderator' | 'admin' | 'superadmin'
        ),
      res,
      'Admin dashboard fetched'
    );
}
