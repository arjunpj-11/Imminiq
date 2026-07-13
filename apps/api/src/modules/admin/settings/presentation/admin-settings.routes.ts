import { Router } from 'express'
import { authenticate } from '../../../../shared/middlewares/auth.middleware'
import { requireAdmin } from '../../../../shared/middlewares/admin.middleware'
import type { IAdminSettingsUseCase } from '../application/use-cases/admin-settings.usecase'
import { AdminSettingsController } from './admin-settings.controller'
export const createAdminSettingsRoutes = (useCase: IAdminSettingsUseCase) => { const router = Router(); const controller = new AdminSettingsController(useCase); router.use(authenticate, requireAdmin); router.get('/', controller.get); router.put('/', controller.update); return router }
