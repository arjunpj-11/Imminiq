import type { NextFunction, Request, Response } from 'express';
import { getAdminActor, sendAdminResult } from '../../../../shared/admin';
import type { AdminSettingsUseCases } from '../application/admin-settings-use-cases.contract';
import { adminSettingsSchema } from './admin-settings.schema';
export class AdminSettingsController {
  constructor(private readonly useCases: AdminSettingsUseCases) {}
  get = (_req: Request, res: Response, next: NextFunction) =>
    sendAdminResult(next, () => this.useCases.get.execute(), res, 'Admin settings fetched');
  update = (req: Request, res: Response, next: NextFunction) =>
    sendAdminResult(
      next,
      () => this.useCases.update.execute(adminSettingsSchema.parse(req.body), getAdminActor(req)),
      res,
      'Admin settings updated'
    );
}
