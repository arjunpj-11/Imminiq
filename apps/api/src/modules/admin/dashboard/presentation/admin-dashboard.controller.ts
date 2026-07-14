import type { NextFunction, Request, Response } from 'express';
import type { AdminDashboardUseCases } from '../application/admin-dashboard-use-cases.contract';
import { sendAdminResult } from '../../shared';

export class AdminDashboardController {
  constructor(private readonly _useCases: AdminDashboardUseCases) {}

  getOverview = (_req: Request, res: Response, next: NextFunction) =>
    sendAdminResult(
      next,
      () => this._useCases.getOverview.execute(),
      res,
      'Admin dashboard fetched'
    );
}
