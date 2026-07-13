import type { NotificationMetadata, NotificationType } from '../notification.types';

export type CreateNotificationInput = {
  userId: string;
  type: NotificationType;
  message: string;
  deepLink?: string;
  metadata?: NotificationMetadata;
};

export interface INotificationCommandRepository {
  createNotification(input: CreateNotificationInput): Promise<void>;
  markNotificationRead(userId: string, notificationId: string): Promise<boolean>;
  markAllNotificationsRead(userId: string): Promise<number>;
}
