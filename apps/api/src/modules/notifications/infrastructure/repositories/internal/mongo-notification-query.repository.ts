import { Notification } from '../../../../../infrastructure/database/models/notification.model'
import type { INotificationQueryRepository, ListNotificationsQuery } from '../../../domain'
import { MongoNotificationsBaseRepository } from '../shared/mongo-notifications-base.repository'
import { MongoNotificationsMapper } from '../shared/mongo-notifications.mapper'
import type { MongoNotificationRecord } from '../shared/mongo-notifications.types'

export class MongoNotificationQueryRepository extends MongoNotificationsBaseRepository implements INotificationQueryRepository {
  constructor(private readonly _mapper = new MongoNotificationsMapper()) { super() }
  listNotifications(query: ListNotificationsQuery) {
    return this.execute('Failed to list notifications', async () => {
      const filter = { userId: query.userId }
      const [records, total, unreadCount] = await Promise.all([
        Notification.find(filter).sort({ createdAt: -1 }).skip((query.page - 1) * query.limit).limit(query.limit).lean<MongoNotificationRecord[]>(),
        Notification.countDocuments(filter), Notification.countDocuments({ ...filter, isRead: false }),
      ])
      return { notifications: records.map((record) => this._mapper.toEntity(record)), total, unreadCount }
    })
  }
}
