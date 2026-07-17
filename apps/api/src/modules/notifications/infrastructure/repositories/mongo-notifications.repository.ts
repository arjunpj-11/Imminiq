import type {
  CreateNotificationInput,
  INotificationRepository,
  ListNotificationsQuery,
} from '../../domain';
import { MongoNotificationCommandRepository } from './internal/mongo-notification-command.repository';
import { MongoNotificationQueryRepository } from './internal/mongo-notification-query.repository';

export class MongoNotificationsRepository implements INotificationRepository {
  constructor(
    private readonly _query = new MongoNotificationQueryRepository(),
    private readonly _command = new MongoNotificationCommandRepository()
  ) {}
  listNotifications(query: ListNotificationsQuery) {
    return this._query.listNotifications(query);
  }
  createNotification(input: CreateNotificationInput) {
    return this._command.createNotification(input);
  }
  markNotificationRead(userId: string, notificationId: string) {
    return this._command.markNotificationRead(userId, notificationId);
  }
  markAllNotificationsRead(userId: string) {
    return this._command.markAllNotificationsRead(userId);
  }
  voteForPoll(userId: string, notificationId: string, optionIndex: number) {
    return this._command.voteForPoll(userId, notificationId, optionIndex);
  }
}
export const mongoNotificationsRepository = new MongoNotificationsRepository();
