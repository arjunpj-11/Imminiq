import type { NextFunction, Request, Response } from 'express'
import { sendAdminResult } from '../../shared'
import type { IGetAdminAnalyticsUseCase } from '../application/use-cases/get-admin-analytics.usecase'
import { adminAnalyticsQuerySchema } from './admin-analytics.schema'
export class AdminAnalyticsController { constructor(private readonly useCase: IGetAdminAnalyticsUseCase) {} get = (req: Request, res: Response, next: NextFunction) => { const input = adminAnalyticsQuerySchema.parse(req.query); return sendAdminResult(next, () => this.useCase.execute(input.days), res, 'Analytics fetched') } }
