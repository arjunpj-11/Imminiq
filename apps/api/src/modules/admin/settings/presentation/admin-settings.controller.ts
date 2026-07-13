import type { NextFunction, Request, Response } from 'express'
import { getAdminActor, sendAdminResult } from '../../shared'
import type { IAdminSettingsUseCase } from '../application/use-cases/admin-settings.usecase'
import { adminSettingsSchema } from './admin-settings.schema'
export class AdminSettingsController { constructor(private readonly useCase: IAdminSettingsUseCase) {} get = (_req: Request, res: Response, next: NextFunction) => sendAdminResult(next, () => this.useCase.get(), res, 'Admin settings fetched'); update = (req: Request, res: Response, next: NextFunction) => sendAdminResult(next, () => this.useCase.update(adminSettingsSchema.parse(req.body), getAdminActor(req)), res, 'Admin settings updated') }
