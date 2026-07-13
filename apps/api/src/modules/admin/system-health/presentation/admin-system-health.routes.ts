import { Router } from 'express'
import { authenticate } from '../../../../shared/middlewares/auth.middleware'
import { requireAdmin } from '../../../../shared/middlewares/admin.middleware'
import type { IGetAdminSystemHealthUseCase } from '../application/use-cases/get-admin-system-health.usecase'
import { AdminSystemHealthController } from './admin-system-health.controller'
export const createAdminSystemHealthRoutes = (useCase: IGetAdminSystemHealthUseCase) => { const router = Router(); const controller = new AdminSystemHealthController(useCase); router.use(authenticate, requireAdmin); router.get('/', controller.get); return router }
