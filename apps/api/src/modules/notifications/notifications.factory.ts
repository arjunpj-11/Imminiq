import { ListNotificationsUseCase, MarkAllNotificationsReadUseCase, MarkNotificationReadUseCase } from './application/notification.use-cases'
import { mongoNotificationRepository } from './infrastructure/repositories/mongo-notification.repository'

export const createNotificationsComposition = () => ({
  useCases: {
    list: new ListNotificationsUseCase(mongoNotificationRepository),
    markRead: new MarkNotificationReadUseCase(mongoNotificationRepository),
    markAllRead: new MarkAllNotificationsReadUseCase(mongoNotificationRepository),
  },
})
