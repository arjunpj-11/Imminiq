import {
  LEADERBOARD_REWARDS,
  LEADERBOARD_SCORING_RULES,
} from '../constants/leaderboard.constants'
import type { LeaderboardRewardsResponseDTO } from '../dtos/leaderboard.dto'

export class GetLeaderboardRewardsUseCase {
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
