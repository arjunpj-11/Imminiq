import { Router } from 'express'
import { authenticate } from '../../../../shared/middlewares/auth.middleware'
import { requireAdmin } from '../../../../shared/middlewares/admin.middleware'
import type { AdminDashboardUseCases } from '../application/admin-dashboard-use-cases.contract'
import { AdminDashboardController } from './admin-dashboard.controller'

export const createAdminDashboardRoutes = (useCases: AdminDashboardUseCases) => {
  const router = Router()
  const controller = new AdminDashboardController(useCases)
  router.use(authenticate, requireAdmin)
  router.get('/', controller.getOverview)
  return router
}
