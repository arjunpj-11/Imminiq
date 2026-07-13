import type { NextFunction, Request, Response } from 'express';
import { sendAdminResult } from '../../shared';
import type { IGetAdminSystemHealthUseCase } from '../application/use-cases/get-admin-system-health.usecase';
export class AdminSystemHealthController {
  constructor(private readonly useCase: IGetAdminSystemHealthUseCase) {}
  get = (_req: Request, res: Response, next: NextFunction) =>
    sendAdminResult(next, () => this.useCase.execute(), res, 'System health fetched');
}
