import { Router } from 'express'
import { authenticate } from '../../../../shared/middlewares/auth.middleware'
import { requireAdmin } from '../../../../shared/middlewares/admin.middleware'
import type { IAdminSupportTicketsUseCase } from '../application/use-cases/admin-support-tickets.usecase'
import { AdminSupportTicketsController } from './admin-support-tickets.controller'
export const createAdminSupportTicketsRoutes = (useCase: IAdminSupportTicketsUseCase) => { const router = Router(); const controller = new AdminSupportTicketsController(useCase); router.use(authenticate, requireAdmin); router.get('/', controller.list); router.patch('/:id', controller.update); return router }
