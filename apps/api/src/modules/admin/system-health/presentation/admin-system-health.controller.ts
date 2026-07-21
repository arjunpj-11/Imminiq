import type { NextFunction, Request, Response } from 'express';
import { getAdminActor, sendAdminResult } from '../../../../shared/admin';
import type { AdminSystemHealthUseCases } from '../application/admin-system-health-use-cases.contract';
import { adminJobActionSchema, adminJobWorklistQuerySchema } from './admin-system-health.schema';
export class AdminSystemHealthController {
  constructor(private readonly useCases: AdminSystemHealthUseCases) {}
  get = (_req: Request, res: Response, next: NextFunction) =>
    sendAdminResult(next, () => this.useCases.get.execute(), res, 'System health fetched');
  listJobs = (req: Request, res: Response, next: NextFunction) =>
    sendAdminResult(
      next,
      () => this.useCases.jobs.list(adminJobWorklistQuerySchema.parse(req.query)),
      res,
      'Background worklist fetched'
    );
  actOnJob = (req: Request, res: Response, next: NextFunction) =>
    sendAdminResult(
      next,
      () =>
        this.useCases.jobs.act(
          String(req.params.queueName),
          String(req.params.jobId),
          adminJobActionSchema.parse(req.body).action,
          getAdminActor(req)
        ),
      res,
      'Background job updated'
    );
}
