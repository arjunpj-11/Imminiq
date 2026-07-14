import { NotificationEntity } from '../../../domain';
import type { MongoNotificationRecord } from './mongo-notifications.types';

export class MongoNotificationsMapper {
  toEntity(record: MongoNotificationRecord) {
    return new NotificationEntity({
      id: record._id.toString(),
      userId: record.userId.toString(),
      type: record.type,
      message: record.message,
      isRead: record.isRead,
      deepLink: record.deepLink ?? null,
      metadata: record.metadata ?? {},
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
    });
  }
}
