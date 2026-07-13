import {
  LEADERBOARD_REWARDS,
  LEADERBOARD_SCORING_RULES,
} from '../leaderboard.constants'
import type { LeaderboardRewardsResponseDTO } from '../leaderboard.dto'

export interface IGetLeaderboardRewardsUseCase {
  execute(): LeaderboardRewardsResponseDTO
}

export class GetLeaderboardRewardsUseCase implements IGetLeaderboardRewardsUseCase {
  execute(): LeaderboardRewardsResponseDTO {
    return {
      students: {
        scoringRules: LEADERBOARD_SCORING_RULES.students,
        reward: LEADERBOARD_REWARDS.students,
      },
      trainers: {
        scoringRules: LEADERBOARD_SCORING_RULES.trainers,
        reward: LEADERBOARD_REWARDS.trainers,
      },
    }
  }
}
