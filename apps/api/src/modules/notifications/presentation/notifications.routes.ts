import { Router } from 'express'
import { authenticate } from '../../../shared/middlewares/auth.middleware'
import { authenticatedApiIpLimiter } from '../../../shared/middlewares/security-rate-limit.middleware'
import { validateIdentifierParam } from '../../../shared/middlewares/validate'
import { createNotificationsComposition } from '../notifications.factory'
import { NotificationsController } from './notifications.controller'

export const createNotificationsRoutes = () => {
  const router = Router()
  const controller = new NotificationsController(createNotificationsComposition().useCases)
  router.use(authenticatedApiIpLimiter, authenticate)
  router.param('notificationId', validateIdentifierParam)
  router.get('/', controller.list)
  router.patch('/read-all', controller.markAllRead)
  router.patch('/:notificationId/read', controller.markRead)
  return router
}
