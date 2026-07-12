import { Notification } from '../../../../../infrastructure/database/models/notification.model'
import type { CreateNotificationInput, INotificationCommandRepository } from '../../../domain'
import { MongoNotificationsBaseRepository } from '../shared/mongo-notifications-base.repository'

export class MongoNotificationCommandRepository extends MongoNotificationsBaseRepository implements INotificationCommandRepository {
  createNotification(input: CreateNotificationInput) {
    return this.execute('Failed to create notification', async () => { await Notification.create(input) })
  }
  markNotificationRead(userId: string, notificationId: string) {
    return this.execute('Failed to mark notification as read', async () => Boolean(await Notification.findOneAndUpdate({ _id: notificationId, userId }, { isRead: true })))
  }
  markAllNotificationsRead(userId: string) {
    return this.execute('Failed to mark notifications as read', async () => (await Notification.updateMany({ userId, isRead: false }, { isRead: true })).modifiedCount)
  }
}
