export const LEADERBOARD_ROUTE_PATHS = {
  ROOT: '/',
  REWARDS: '/rewards',
} as const;

export type LeaderboardRoutePath =
  (typeof LEADERBOARD_ROUTE_PATHS)[keyof typeof LEADERBOARD_ROUTE_PATHS];
