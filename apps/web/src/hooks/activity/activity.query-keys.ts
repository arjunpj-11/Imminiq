export const activityQueryKeys = {
  all: ['profile-activity'] as const,
  recent: (limit: number) => [...activityQueryKeys.all, 'recent', limit] as const,
  paginated: (page: number, limit: number) =>
    [...activityQueryKeys.all, 'page', page, limit] as const,
}
