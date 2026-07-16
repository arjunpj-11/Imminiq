export const NOTIFICATION_REFETCH_INTERVAL_MS = 15_000;
export const NOTIFICATION_PAGE_LIMIT = 20;

export const NOTIFICATION_API_PATHS = {
  root: '/notifications',
  readAll: '/notifications/read-all',
  readOne: (notificationId: string) => `/notifications/${notificationId}/read`,
  vote: (notificationId: string) => `/notifications/${notificationId}/vote`,
} as const;
