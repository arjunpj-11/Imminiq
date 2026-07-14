import type { NextFunction, Request, Response } from 'express';
import { sendAdminResult } from '../../shared/presentation';
import type { AdminAnalyticsUseCases } from '../application/admin-analytics-use-cases.contract';
import { adminAnalyticsQuerySchema } from './admin-analytics.schema';
export class AdminAnalyticsController {
  constructor(private readonly useCases: AdminAnalyticsUseCases) {}
  get = (req: Request, res: Response, next: NextFunction) => {
    const input = adminAnalyticsQuerySchema.parse(req.query);
    const to = input.to ? new Date(`${input.to}T23:59:59.999Z`) : new Date();
    const from = input.from
      ? new Date(`${input.from}T00:00:00.000Z`)
      : new Date(to.getTime() - (input.days - 1) * 86400000);
    const days = Math.max(1, Math.ceil((to.getTime() - from.getTime()) / 86400000));
    return sendAdminResult(
      next,
      () => this.useCases.get.execute({ from, to, days }),
      res,
      'Activity fetched'
    );
  };
}
