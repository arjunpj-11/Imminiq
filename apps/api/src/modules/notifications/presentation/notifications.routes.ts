import { Router } from 'express';
import type { NotificationsUseCases } from '../application';
import { authenticate } from '../../../shared/middlewares/auth.middleware';
import { authenticatedApiUserLimiter } from '../../../shared/middlewares/security-rate-limit.middleware';
import {
  validate,
  validateIdentifierParam,
  validateQuery,
} from '../../../shared/middlewares/validate.middleware';
import { NotificationsController } from './notifications.controller';
import { NOTIFICATION_ROUTE_PATHS } from './notifications.route.constants';
import { notificationPollVoteSchema, notificationsListQuerySchema } from './notifications.schema';

export const createNotificationsRoutes = (useCases: NotificationsUseCases) => {
  const controller = new NotificationsController(useCases);
  const router = Router();
  router.param('notificationId', validateIdentifierParam);
  router.use(authenticate, authenticatedApiUserLimiter);
  router.get(
    NOTIFICATION_ROUTE_PATHS.ROOT,
    validateQuery(notificationsListQuerySchema),
    controller.listNotifications
  );
  router.patch(NOTIFICATION_ROUTE_PATHS.READ_ALL, controller.markAllNotificationsRead);
  router.patch(NOTIFICATION_ROUTE_PATHS.READ_ONE, controller.markNotificationRead);
  router.post(
    NOTIFICATION_ROUTE_PATHS.VOTE,
    validate(notificationPollVoteSchema),
    controller.voteForPoll
  );
  return router;
};
