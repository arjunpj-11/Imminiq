import type { NotificationEntity } from '../notification.types'

export interface INotificationRepository {
  list(userId: string, page: number, limit: number): Promise<{ notifications: NotificationEntity[]; total: number; unreadCount: number }>
  markRead(userId: string, notificationId: string): Promise<boolean>
  markAllRead(userId: string): Promise<number>
}
