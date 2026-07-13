import { Router } from 'express'
import type { NotificationsUseCases } from '../application'
import { authenticate } from '../../../shared/middlewares/auth.middleware'
import { authenticatedApiIpLimiter } from '../../../shared/middlewares/security-rate-limit.middleware'
import { validateIdentifierParam, validateQuery } from '../../../shared/middlewares/validate'
import { NotificationsController } from './notifications.controller'
import { NOTIFICATION_ROUTE_PATHS } from './notifications.route.constants'
import { notificationsListQuerySchema } from './notifications.schema'

export const createNotificationsRoutes = (useCases: NotificationsUseCases) => {
  const controller = new NotificationsController(useCases)
  const router = Router()
  router.param('notificationId', validateIdentifierParam)
  router.use(authenticatedApiIpLimiter, authenticate)
  router.get(NOTIFICATION_ROUTE_PATHS.ROOT, validateQuery(notificationsListQuerySchema), controller.listNotifications)
  router.patch(NOTIFICATION_ROUTE_PATHS.READ_ALL, controller.markAllNotificationsRead)
  router.patch(NOTIFICATION_ROUTE_PATHS.READ_ONE, controller.markNotificationRead)
  return router
}
