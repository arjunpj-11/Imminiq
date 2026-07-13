import type { NextFunction, Request, Response } from 'express'
import { getAdminActor, sendAdminResult } from '../../shared'
import type { IAdminTrackersUseCase } from '../application/use-cases/admin-trackers.usecase'
import { adminTrackersQuerySchema } from './admin-trackers.schema'
export class AdminTrackersController {
  constructor(private readonly useCase: IAdminTrackersUseCase) {}
  list = (req: Request, res: Response, next: NextFunction) => sendAdminResult(next, () => this.useCase.list(adminTrackersQuerySchema.parse(req.query)), res, 'Trackers fetched')
  getDetail = (req: Request, res: Response, next: NextFunction) => sendAdminResult(next, () => this.useCase.getDetail(String(req.params.id)), res, 'Tracker fetched')
  delete = (req: Request, res: Response, next: NextFunction) => sendAdminResult(next, () => this.useCase.delete(String(req.params.id), getAdminActor(req)), res, 'Tracker deleted and owner notified')
}
