// Realtime events are the primary update path. This interval is only a recovery
// mechanism for suspended tabs and short network interruptions.
export const NOTIFICATION_REFETCH_INTERVAL_MS = 60_000;
export const NOTIFICATION_PAGE_LIMIT = 20;

export const NOTIFICATION_API_PATHS = {
  root: '/notifications',
  readAll: '/notifications/read-all',
  readOne: (notificationId: string) => `/notifications/${notificationId}/read`,
  vote: (notificationId: string) => `/notifications/${notificationId}/vote`,
} as const;
