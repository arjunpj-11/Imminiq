export const LEADERBOARD_SECTIONS = ['students', 'trainers'] as const;

export type LeaderboardSection = (typeof LEADERBOARD_SECTIONS)[number];
