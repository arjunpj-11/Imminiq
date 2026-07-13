import type { NotificationEntity } from '../entities/notification.entity';

export type ListNotificationsQuery = { userId: string; page: number; limit: number };
export type NotificationPage = {
  notifications: NotificationEntity[];
  total: number;
  unreadCount: number;
};

export interface INotificationQueryRepository {
  listNotifications(query: ListNotificationsQuery): Promise<NotificationPage>;
}
