import type { NextFunction, Request, Response } from 'express'
import { sendAdminResult } from '../../shared'
import type { IAdminMockTestsUseCase } from '../application/use-cases/admin-mock-tests.usecase'
import { adminMockTestsQuerySchema } from './admin-mock-tests.schema'
export class AdminMockTestsController { constructor(private readonly useCase: IAdminMockTestsUseCase) {} list = (req: Request, res: Response, next: NextFunction) => sendAdminResult(next, () => this.useCase.list(adminMockTestsQuerySchema.parse(req.query)), res, 'Mock tests fetched'); getDetail = (req: Request, res: Response, next: NextFunction) => sendAdminResult(next, () => this.useCase.getDetail(String(req.params.id)), res, 'Mock test fetched') }
