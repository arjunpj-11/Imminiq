export interface INotification {
  id: string;
  type: string;
  message: string;
  isRead: boolean;
  deepLink?: string;
  metadata?: Record<string, unknown>;
  createdAt: string;
}

export interface INotificationList {
  notifications: INotification[];
  pagination: {
    page: number;
    limit: number;
    totalItems: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
  unreadCount: number;
}
