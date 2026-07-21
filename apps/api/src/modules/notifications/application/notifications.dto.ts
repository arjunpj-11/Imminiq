import type { NotificationEntity, NotificationMetadata, NotificationType } from '../domain';

export type NotificationDTO = {
  id: string;
  type: NotificationType;
  message: string;
  isRead: boolean;
  deepLink: string | null;
  metadata: NotificationMetadata;
  createdAt: string;
};

export type ListNotificationsPayloadDTO = { page: number; limit: number };
export type NotificationPageMappingInputDTO = {
  notifications: NotificationEntity[];
  total: number;
  unreadCount: number;
  page: number;
  limit: number;
};
export type ListNotificationsResponseDTO = {
  notifications: NotificationDTO[];
  pagination: {
    page: number;
    limit: number;
    totalItems: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
  unreadCount: number;
};
export type CreateNotificationPayloadDTO = {
  userId: string;
  type: NotificationType;
  message: string;
  deepLink?: string;
  metadata?: NotificationMetadata;
};
export type MarkNotificationReadResponseDTO = { updated: boolean };
export type MarkAllNotificationsReadResponseDTO = { updated: number };
export type VoteNotificationPollPayloadDTO = { optionIndex: number };
export type VoteNotificationPollResponseDTO = { optionIndex: number };
