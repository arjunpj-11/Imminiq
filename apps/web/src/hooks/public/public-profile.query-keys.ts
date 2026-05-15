export const publicProfileQueryKeys = {
  all: ['public-profile'] as const,
  detail: (username: string, params?: Record<string, unknown>) =>
    [...publicProfileQueryKeys.all, username, params ?? {}] as const,
}
