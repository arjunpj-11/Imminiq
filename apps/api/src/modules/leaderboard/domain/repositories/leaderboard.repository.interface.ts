import type { LeaderboardActivityRepositoryContract } from './leaderboard-activity.repository.interface'
import type { LeaderboardQueryRepositoryContract } from './leaderboard-query.repository.interface'

export interface LeaderboardRepositoryContract
  extends LeaderboardQueryRepositoryContract,
    LeaderboardActivityRepositoryContract {}
