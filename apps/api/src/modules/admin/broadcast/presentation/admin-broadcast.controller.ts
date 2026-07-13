import type { NextFunction, Request, Response } from 'express'
import { getAdminActor, sendAdminResult } from '../../shared'
import type { IAdminBroadcastsUseCase } from '../application/use-cases/admin-broadcasts.usecase'
import { adminBroadcastSchema, adminBroadcastsQuerySchema } from './admin-broadcast.schema'
export class AdminBroadcastController { constructor(private readonly useCase: IAdminBroadcastsUseCase) {} list = (req: Request, res: Response, next: NextFunction) => sendAdminResult(next, () => this.useCase.list(adminBroadcastsQuerySchema.parse(req.query)), res, 'Broadcasts fetched'); send = (req: Request, res: Response, next: NextFunction) => sendAdminResult(next, () => this.useCase.send(adminBroadcastSchema.parse(req.body), getAdminActor(req)), res, 'Broadcast sent') }
