import type { LeaderboardScope, LeaderboardSection } from '../types/leaderboard.types';

export const LEADERBOARD_ENDPOINTS = {
  leaderboard: '/leaderboard',
  rewards: '/leaderboard/rewards',
} as const;

export const LEADERBOARD_ROUTES = {
  leaderboard: '/leaderboard',
  rewards: '/leaderboard/rewards',
} as const;

export const LEADERBOARD_DEFAULT_SECTION: LeaderboardSection = 'students';
export const LEADERBOARD_DEFAULT_SCOPE: LeaderboardScope = 'global';
export const LEADERBOARD_DISPLAY_LIMIT = 8;
export const LEADERBOARD_STALE_TIME_MS = 60_000;

export const LEADERBOARD_SECTIONS: readonly LeaderboardSection[] = ['students', 'trainers'];

export const LEADERBOARD_SCOPES: readonly LeaderboardScope[] = ['global', 'friends', 'weekly'];

export const LEADERBOARD_SECTION_LABELS: Record<
  LeaderboardSection,
  { label: string; singular: string }
> = {
  students: {
    label: 'Students',
    singular: 'Scholar',
  },
  trainers: {
    label: 'Trainers',
    singular: 'Trainer',
  },
};

export const LEADERBOARD_SCOPE_LABELS: Record<LeaderboardScope, string> = {
  global: 'Global',
  friends: 'Friends',
  weekly: 'Weekly',
};
