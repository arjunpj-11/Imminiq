export const PROFILE_API_PATHS = {
  me: '/users/me',
  stats: '/users/me/stats',
  badges: '/users/me/badges',
  publishedTrackers: '/users/me/published-trackers',
  publicProfile: (username: string) => `/users/${username}/public-profile`,
  avatar: '/uploads/avatar',
  avatarAiPreview: '/uploads/avatar/ai-preview',
  banner: '/uploads/banner',
  bannerAiPreview: '/uploads/banner/ai-preview',
} as const;
