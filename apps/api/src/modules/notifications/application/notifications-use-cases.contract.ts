import type * as Application from './index';
export type NotificationsUseCases = {
  listNotifications: Application.IListNotificationsUseCase;
  createNotification: Application.ICreateNotificationUseCase;
  markNotificationRead: Application.IMarkNotificationReadUseCase;
  markAllNotificationsRead: Application.IMarkAllNotificationsReadUseCase;
};
