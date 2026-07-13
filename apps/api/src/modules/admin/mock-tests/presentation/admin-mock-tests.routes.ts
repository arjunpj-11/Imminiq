import { Router } from 'express'
import { authenticate } from '../../../../shared/middlewares/auth.middleware'
import { requireAdmin } from '../../../../shared/middlewares/admin.middleware'
import type { IAdminMockTestsUseCase } from '../application/use-cases/admin-mock-tests.usecase'
import { AdminMockTestsController } from './admin-mock-tests.controller'
export const createAdminMockTestsRoutes = (useCase: IAdminMockTestsUseCase) => { const router = Router(); const controller = new AdminMockTestsController(useCase); router.use(authenticate, requireAdmin); router.get('/', controller.list); router.get('/:id', controller.getDetail); return router }
