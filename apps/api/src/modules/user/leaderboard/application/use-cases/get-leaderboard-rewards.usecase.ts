import { LEADERBOARD_SCORING_RULES } from '../leaderboard.constants';
import type { LeaderboardRewardsResponseDTO } from '../leaderboard.dto';
import type { ILeaderboardPolicyReader } from '../../../../../shared/platform-policy';

export interface IGetLeaderboardRewardsUseCase {
  execute(): Promise<LeaderboardRewardsResponseDTO>;
}

export class GetLeaderboardRewardsUseCase implements IGetLeaderboardRewardsUseCase {
  constructor(private readonly _policyReader: ILeaderboardPolicyReader) {}

  async execute(): Promise<LeaderboardRewardsResponseDTO> {
    const policy = await this._policyReader.getLeaderboardPolicy();

    const reward = (section: 'students' | 'trainers') => {
      const badgeName = section === 'students' ? policy.studentBadgeName : policy.trainerBadgeName;
      const coins = section === 'students' ? policy.studentRewardCoins : policy.trainerRewardCoins;
      return {
        title: 'Elite Distinction',
        description: `Reach the Top ${policy.targetRank} this week to unlock the ${badgeName} badge and ${coins} gold coins.`,
        targetRank: policy.targetRank,
        badgeName,
        coins,
      };
    };

    return {
      students: {
        scoringRules: LEADERBOARD_SCORING_RULES.students,
        reward: reward('students'),
      },
      trainers: {
        scoringRules: LEADERBOARD_SCORING_RULES.trainers,
        reward: reward('trainers'),
      },
    };
  }
}
