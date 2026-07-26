import type { ICommunityVerificationRepository } from '../../domain/repositories/community-verification.repository.interface';
import type { ICommunityActivityRecorder } from '../../domain/services/community-activity.interface';
import type {
  VoteVerificationSubmissionPayloadDTO,
  VoteVerificationSubmissionViewDTO,
} from '../community.dto';
import { CommunityApplicationError } from '../community-application.error';
import type { ICommunityMapper } from '../community.mapper';
import type { ICommunityVerificationPolicy } from '../community-verification.policy';
import type { ICommunityPolicyReader } from '../../../../../shared/platform-policy';
import type { ICommunityVerificationRewardService } from '../services/community-verification-reward.service';

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
      | 'findVerificationSubmissionById'
      | 'findVoteBySubmissionAndUser'
      | 'getUserCoinBalance'
    >,
    private readonly _policy: ICommunityVerificationPolicy,
    private readonly _activityRecorder: ICommunityActivityRecorder,
    private readonly _mapper: ICommunityMapper,
    private readonly _policyReader: ICommunityPolicyReader,
    private readonly _rewardService: ICommunityVerificationRewardService
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

    await this._rewardService.settle({
      submissionId: updatedSubmission.id,
      consensusChoice: updatedSubmission.consensusChoice ?? null,
      trackerId: updatedSubmission.trackerId,
      ownerId: updatedSubmission.ownerId,
      trackerTitle: updatedSubmission.title,
      policy,
    });
    const [currentUserVote, currentUserBalance] = await Promise.all([
      this._repository.findVoteBySubmissionAndUser(
        updatedSubmission.id,
        payload.userId
      ),
      this._repository.getUserCoinBalance(payload.userId),
    ]);
    const currentUserRewardCoins = Math.max(
      0,
      Number(currentUserVote?.rewardCoins ?? 0)
    );

    const voteView = this._mapper.toVoteView(vote);

    return {
      vote: {
        ...voteView,
        rewardCoins: currentUserRewardCoins,
      },
      submission: this._mapper.toVerificationSubmissionView(updatedSubmission),
      reward: {
        awarded: currentUserRewardCoins > 0,
        coins: currentUserRewardCoins,
        balance: currentUserBalance,
      },
    };
  }
}
