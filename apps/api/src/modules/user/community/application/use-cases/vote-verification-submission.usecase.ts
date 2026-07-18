import type { ICommunityVerificationRepository } from '../../domain/repositories/community-verification.repository.interface';
import type { ICommunityActivityRecorder } from '../../domain/services/community-activity.interface';
import type {
  VoteVerificationSubmissionPayloadDTO,
  VoteVerificationSubmissionViewDTO,
} from '../community.dto';
import { CommunityApplicationError } from '../community-application.error';
import type { ICommunityMapper } from '../community.mapper';
import type { ICommunityVerificationPolicy } from '../community-verification.policy';
import type {
  CommunityPolicy,
  ICommunityPolicyReader,
} from '../../../../../shared/platform-policy';

type ConsensusRewardInput = {
  submissionId: string;
  currentUserId: string;
  consensusChoice: 'pass' | 'fail' | null;
  trackerId: string;
  ownerId: string;
  trackerTitle: string;
  policy: CommunityPolicy;
};

type ConsensusRewardResult = {
  currentUserAwarded: boolean;
  currentUserRewardCoins: number;
  currentUserBalance: number;
};

export interface IVoteVerificationSubmissionUseCase {
  execute(
    payload: VoteVerificationSubmissionPayloadDTO
  ): Promise<VoteVerificationSubmissionViewDTO>;
}

export class VoteVerificationSubmissionUseCase implements IVoteVerificationSubmissionUseCase {
  constructor(
    private readonly _repository: Pick<
      ICommunityVerificationRepository,
      | 'createVerificationVote'
      | 'findUnrewardedMajorityVotes'
      | 'findVerificationSubmissionById'
      | 'findVoteBySubmissionAndUser'
      | 'getUserCoinBalance'
      | 'markVerificationVoteRewarded'
    >,
    private readonly _policy: ICommunityVerificationPolicy,
    private readonly _activityRecorder: ICommunityActivityRecorder,
    private readonly _mapper: ICommunityMapper,
    private readonly _policyReader: ICommunityPolicyReader
  ) {}

  async execute(
    payload: VoteVerificationSubmissionPayloadDTO
  ): Promise<VoteVerificationSubmissionViewDTO> {
    const policy = await this._policyReader.getCommunityPolicy();
    const submission = await this._repository.findVerificationSubmissionById(
      payload.submissionId,
      payload.userId
    );

    if (!submission) {
      throw CommunityApplicationError.notFound('Verification submission not found');
    }

    let vote = await this._repository.findVoteBySubmissionAndUser(
      payload.submissionId,
      payload.userId
    );

    if (vote) {
      /*
       * Reusing the same vote makes this operation recoverable
       * when the vote was stored but activity recording failed.
       */
      if (vote.choice !== payload.vote) {
        throw CommunityApplicationError.conflict(
          'You have already reviewed this submission with a different vote'
        );
      }
    } else {
      this._policy.ensureCanVote(submission, payload.userId);

      vote = await this._repository.createVerificationVote({
        submissionId: payload.submissionId,
        userId: payload.userId,
        choice: payload.vote,
        reason: payload.reason,
        rewardCoins: 0,
      });
    }

    /*
     * The vote ID is the idempotency source. Retrying this use
     * case cannot award the normal teacher XP twice.
     */
    await this._activityRecorder.recordVerificationVoteSubmitted({
      userId: vote.userId,
      ownerId: submission.ownerId,
      trackerId: submission.trackerId,
      submissionId: submission.id,
      voteId: vote.id,
      trackerTitle: submission.title,
      xpAwarded: policy.voteTeacherXp,

      ...(vote.createdAt
        ? {
            occurredAt: vote.createdAt,
          }
        : {}),
    });

    const updatedSubmission = await this._repository.findVerificationSubmissionById(
      payload.submissionId,
      payload.userId
    );

    if (!updatedSubmission) {
      throw CommunityApplicationError.notFound('Verification submission not found after voting');
    }

    if (updatedSubmission.consensusChoice === 'pass') {
      await this._activityRecorder.recordTrackerVerified({
        ownerId: updatedSubmission.ownerId,
        trackerId: updatedSubmission.trackerId,
        submissionId: updatedSubmission.id,
        trackerTitle: updatedSubmission.title,
      });
    }

    const rewardResult = await this.awardConsensusRewards({
      submissionId: updatedSubmission.id,
      currentUserId: payload.userId,
      consensusChoice: updatedSubmission.consensusChoice ?? null,
      trackerId: updatedSubmission.trackerId,
      ownerId: updatedSubmission.ownerId,
      trackerTitle: updatedSubmission.title,
      policy,
    });

    const voteView = this._mapper.toVoteView(vote);

    return {
      vote: {
        ...voteView,
        rewardCoins: rewardResult.currentUserRewardCoins,
      },
      submission: this._mapper.toVerificationSubmissionView(updatedSubmission),
      reward: {
        awarded: rewardResult.currentUserAwarded,
        coins: rewardResult.currentUserRewardCoins,
        balance: rewardResult.currentUserBalance,
      },
    };
  }

  private async awardConsensusRewards(
    data: ConsensusRewardInput
  ): Promise<ConsensusRewardResult> {
    if (data.consensusChoice) {
      const rewardableVotes = await this._repository.findUnrewardedMajorityVotes(
        data.submissionId,
        data.consensusChoice
      );

      for (const rewardableVote of rewardableVotes) {
        /*
         * Award through the activity module first.
         *
         * If marking the vote fails afterward, retrying is safe:
         * the activity event key is based on voteId and cannot
         * add XP or coins twice.
         */
        await this._activityRecorder.recordVerificationMajorityWon({
          userId: rewardableVote.userId,
          ownerId: data.ownerId,
          trackerId: data.trackerId,
          submissionId: data.submissionId,
          voteId: rewardableVote.id,
          trackerTitle: data.trackerTitle,
          xpAwarded: data.policy.majorityTeacherXp,
          coinsAwarded: data.policy.reviewRewardCoins,
        });

        await this._repository.markVerificationVoteRewarded(
          rewardableVote.id,
          data.policy.reviewRewardCoins
        );
      }
    }

    const [currentUserVote, currentUserBalance] = await Promise.all([
      this._repository.findVoteBySubmissionAndUser(data.submissionId, data.currentUserId),

      this._repository.getUserCoinBalance(data.currentUserId),
    ]);

    const currentUserRewardCoins = Math.max(0, Number(currentUserVote?.rewardCoins ?? 0));

    return {
      currentUserAwarded: currentUserRewardCoins > 0,
      currentUserRewardCoins,
      currentUserBalance,
    };
  }
}
