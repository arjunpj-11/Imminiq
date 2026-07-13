export const notificationKeys = {
  all: ['notifications'] as const,
  lists: () => [...notificationKeys.all, 'list'] as const,
  list: (page: number, limit: number) => [...notificationKeys.lists(), { page, limit }] as const,
};
