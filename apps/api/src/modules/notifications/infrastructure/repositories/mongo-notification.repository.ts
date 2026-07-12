import { Notification } from '../../../../infrastructure/database/models/notification.model'
import type { INotificationRepository } from '../../domain/repositories/notification.repository.interface'
import type { NotificationEntity } from '../../domain/notification.types'

export class MongoNotificationRepository implements INotificationRepository {
  async list(userId: string, page: number, limit: number) {
    const query = { userId }
    const [records, total, unreadCount] = await Promise.all([
      Notification.find(query).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit).lean(),
      Notification.countDocuments(query),
      Notification.countDocuments({ userId, isRead: false }),
    ])
    return {
      notifications: records.map((item) => ({
        _id: item._id.toString(), type: item.type, message: item.message,
        isRead: item.isRead, ...(item.deepLink ? { deepLink: item.deepLink } : {}),
        ...(item.metadata ? { metadata: item.metadata as Record<string, unknown> } : {}), createdAt: item.createdAt,
      })) as NotificationEntity[], total, unreadCount,
    }
  }

  async markRead(userId: string, notificationId: string) {
    return Boolean(await Notification.findOneAndUpdate({ _id: notificationId, userId }, { isRead: true }))
  }

  async markAllRead(userId: string) {
    const result = await Notification.updateMany({ userId, isRead: false }, { isRead: true })
    return result.modifiedCount
  }
}

export const mongoNotificationRepository = new MongoNotificationRepository()
