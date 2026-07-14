export const LEADERBOARD_SCOPES = ['global', 'friends', 'weekly'] as const;

export type LeaderboardScope = (typeof LEADERBOARD_SCOPES)[number];
