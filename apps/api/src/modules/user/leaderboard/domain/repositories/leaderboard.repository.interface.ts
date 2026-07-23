import type { ILeaderboardActivityRepository } from './leaderboard-activity.repository.interface';
import type { ILeaderboardQueryRepository } from './leaderboard-query.repository.interface';

export interface ILeaderboardRepository
  extends ILeaderboardQueryRepository,
    ILeaderboardActivityRepository {}
