import type { INotificationRepository } from '../domain/repositories/notification.repository.interface'

export class ListNotificationsUseCase {
  constructor(private readonly repository: INotificationRepository) {}
  execute(userId: string, page = 1, limit = 20) {
    return this.repository.list(userId, Math.max(1, page), Math.min(50, Math.max(1, limit)))
  }
}

export class MarkNotificationReadUseCase {
  constructor(private readonly repository: INotificationRepository) {}
  execute(userId: string, notificationId: string) {
    return this.repository.markRead(userId, notificationId)
  }
}

export class MarkAllNotificationsReadUseCase {
  constructor(private readonly repository: INotificationRepository) {}
  execute(userId: string) { return this.repository.markAllRead(userId) }
}
