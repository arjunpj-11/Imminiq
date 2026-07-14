import type { NextFunction, Request, Response } from 'express';
import { sendAdminResult } from '../../shared';
import type { AdminSystemHealthUseCases } from '../application/admin-system-health-use-cases.contract';
export class AdminSystemHealthController {
  constructor(private readonly useCases: AdminSystemHealthUseCases) {}
  get = (_req: Request, res: Response, next: NextFunction) =>
    sendAdminResult(next, () => this.useCases.get.execute(), res, 'System health fetched');
}
