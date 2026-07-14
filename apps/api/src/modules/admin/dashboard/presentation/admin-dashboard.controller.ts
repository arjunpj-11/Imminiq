import type { NextFunction, Request, Response } from 'express';
import type { AdminDashboardUseCases } from '../application/admin-dashboard-use-cases.contract';
import { ApiResponse } from '../../../../shared/utils/ApiResponse';

export class AdminDashboardController {
  constructor(private readonly _useCases: AdminDashboardUseCases) {}

  getOverview = async (_req: Request, res: Response, next: NextFunction) => {
    try {
      res.json(
        new ApiResponse('Admin dashboard fetched', await this._useCases.getOverview.execute())
      );
    } catch (error) {
      next(error);
    }
  };
}
