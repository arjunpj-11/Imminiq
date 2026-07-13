import { Router } from 'express'
import { authenticate } from '../../../../shared/middlewares/auth.middleware'
import { requireAdmin } from '../../../../shared/middlewares/admin.middleware'
import type { AdminUsersUseCases } from '../application/admin-users-use-cases.contract'
import { AdminUsersController } from './admin-users.controller'

export const createAdminUsersRoutes = (useCases: AdminUsersUseCases) => {
  const router = Router()
  const controller = new AdminUsersController(useCases)
  router.use(authenticate, requireAdmin)
  router.get('/', controller.list)
  router.get('/:userId', controller.getDetail)
  router.patch('/:userId/status', controller.setStatus)
  return router
}
