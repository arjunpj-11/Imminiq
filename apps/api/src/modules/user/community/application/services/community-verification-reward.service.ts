import type { ICommunityVerificationRepository } from '../../domain/repositories/community-verification.repository.interface';
import type { ICommunityActivityRecorder } from '../../domain/services/community-activity.interface';
import type {
  CommunityPolicy,
  ICommunityPolicyReader,
} from '../../../../../shared/platform-policy';

export type SettleCommunityVerificationRewardsInput = {
  submissionId: string;
  consensusChoice: 'pass' | 'fail' | null;
  trackerId: string;
  ownerId: string;
  trackerTitle: string;
  policy?: CommunityPolicy;
};

export interface ICommunityVerificationRewardService {
  settle(input: SettleCommunityVerificationRewardsInput): Promise<void>;
}

export class CommunityVerificationRewardService
  implements ICommunityVerificationRewardService
{
  constructor(
    private readonly _repository: Pick<
      ICommunityVerificationRepository,
      'findUnrewardedMajorityVotes' | 'markVerificationVoteRewarded'
    >,
    private readonly _activityRecorder: ICommunityActivityRecorder,
    private readonly _policyReader: ICommunityPolicyReader
  ) {}

  async settle(input: SettleCommunityVerificationRewardsInput): Promise<void> {
    if (!input.consensusChoice) return;
    const policy = input.policy ?? (await this._policyReader.getCommunityPolicy());

    if (input.consensusChoice === 'pass') {
      await this._activityRecorder.recordTrackerVerified({
        ownerId: input.ownerId,
        trackerId: input.trackerId,
        submissionId: input.submissionId,
        trackerTitle: input.trackerTitle,
      });
    }

    const rewardableVotes = await this._repository.findUnrewardedMajorityVotes(
      input.submissionId,
      input.consensusChoice
    );

    for (const rewardableVote of rewardableVotes) {
      /*
       * The activity event is keyed by vote id. If a retry happens after the
       * activity succeeds but before the vote is marked, no duplicate reward
       * can be applied.
       */
      await this._activityRecorder.recordVerificationMajorityWon({
        userId: rewardableVote.userId,
        ownerId: input.ownerId,
        trackerId: input.trackerId,
        submissionId: input.submissionId,
        voteId: rewardableVote.id,
        trackerTitle: input.trackerTitle,
        xpAwarded: policy.majorityTeacherXp,
        coinsAwarded: policy.reviewRewardCoins,
      });

      await this._repository.markVerificationVoteRewarded(
        rewardableVote.id,
        policy.reviewRewardCoins
      );
    }
  }
}
