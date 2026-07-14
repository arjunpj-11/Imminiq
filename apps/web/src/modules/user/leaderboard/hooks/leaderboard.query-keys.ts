import type { ILeaderboardQueryInput } from '../types/leaderboard.types';

export const leaderboardQueryKeys = {
  all: ['leaderboard'] as const,
  lists: () => [...leaderboardQueryKeys.all, 'list'] as const,
  list: (input: ILeaderboardQueryInput) =>
    [...leaderboardQueryKeys.lists(), input.section, input.scope, input.limit] as const,
  rewards: () => [...leaderboardQueryKeys.all, 'rewards'] as const,
};
