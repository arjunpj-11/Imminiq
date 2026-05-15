export const profileQueryKeys = {
  all: ['users-profile'] as const,
  me: () => [...profileQueryKeys.all, 'me'] as const,
  stats: () => [...profileQueryKeys.all, 'stats'] as const,
  badges: (page: number, limit: number) =>
    [...profileQueryKeys.all, 'badges', page, limit] as const,
  trackers: (params: Record<string, unknown>) =>
    [...profileQueryKeys.all, 'published-trackers', params] as const,
  uploadState: () => [...profileQueryKeys.all, 'upload-state'] as const,
}
