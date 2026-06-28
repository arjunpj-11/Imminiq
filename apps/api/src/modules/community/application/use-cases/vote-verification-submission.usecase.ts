// apps/api/src/modules/community/application/use-cases/vote-verification-submission.usecase.ts

import { COMMUNITY_REVIEW_REWARD_COINS } from '../../domain/constants/community.constants'
import type { CommunityRepositoryContract } from '../../domain/repositories/community.repository.interface'
import type { CommunityCoinLedgerContract } from '../../domain/services/community-coin-ledger.service.interface'
import type {
  VoteVerificationSubmissionPayload,
  VoteVerificationSubmissionView,
} from '../dtos/community.dto'
import { CommunityApplicationError } from '../errors/community-application.error'
import type { CommunityMapperContract } from '../mappers/community.mapper'
import type { CommunityVerificationPolicyContract } from '../policies/community-verification.policy'

export class VoteVerificationSubmissionUseCase {
  constructor(
    private readonly _repository: CommunityRepositoryContract,
    private readonly _coinLedger: CommunityCoinLedgerContract,
    private readonly _policy: CommunityVerificationPolicyContract,
    private readonly _mapper: CommunityMapperContract,
  ) {}

  async execute(
    payload: VoteVerificationSubmissionPayload,
  ): Promise<VoteVerificationSubmissionView> {
    const submission = await this._repository.findVerificationSubmissionById(
      payload.submissionId,
      payload.userId,
    )

    if (!submission) {
      throw CommunityApplicationError.notFound(
        'Verification submission not found',
      )
    }

    this._policy.ensureCanVote(submission, payload.userId)

    const existingVote = await this._repository.findVoteBySubmissionAndUser(
      payload.submissionId,
      payload.userId,
    )

    if (existingVote) {
      throw CommunityApplicationError.conflict(
        'You have already reviewed this submission',
      )
    }

    const vote = await this._repository.createVerificationVote({
      submissionId: payload.submissionId,
      userId: payload.userId,
      choice: payload.vote,
      reason: payload.reason,
      rewardCoins: 0,
    })

    const updatedSubmission =
      await this._repository.findVerificationSubmissionById(
        payload.submissionId,
        payload.userId,
      )

    const rewardResult = await this.awardConsensusRewards({
      submissionId: payload.submissionId,
      currentUserId: payload.userId,
      consensusChoice: updatedSubmission?.consensusChoice ?? null,
    })

    const voteView = this._mapper.toVoteView(vote)

    return {
      vote: {
        ...voteView,
        rewardCoins: rewardResult.currentUserRewardCoins,
      },
      submission: this._mapper.toVerificationSubmissionView(
        updatedSubmission ?? submission,
      ),
      reward: {
        awarded: rewardResult.currentUserAwarded,
        coins: rewardResult.currentUserRewardCoins,
        balance: rewardResult.currentUserBalance,
      },
    }
  }

  private async awardConsensusRewards(data: {
    submissionId: string
    currentUserId: string
    consensusChoice: 'pass' | 'fail' | null
  }): Promise<{
    currentUserAwarded: boolean
    currentUserRewardCoins: number
    currentUserBalance: number
  }> {
    if (!data.consensusChoice) {
      return {
        currentUserAwarded: false,
        currentUserRewardCoins: 0,
        currentUserBalance: 0,
      }
    }

    const rewardableVotes =
      await this._repository.findUnrewardedMajorityVotes(
        data.submissionId,
        data.consensusChoice,
      )

    let currentUserAwarded = false
    let currentUserRewardCoins = 0
    let currentUserBalance = 0

    for (const rewardableVote of rewardableVotes) {
      const markedRewarded =
        await this._repository.markVerificationVoteRewarded(
          rewardableVote.id,
          COMMUNITY_REVIEW_REWARD_COINS,
        )

      if (!markedRewarded) {
        continue
      }

      const award = await this._coinLedger.awardCoins({
        userId: rewardableVote.userId,
        sourceId: data.submissionId,
        reason: 'verification_majority_reward',
        amount: COMMUNITY_REVIEW_REWARD_COINS,
      })

      if (rewardableVote.userId === data.currentUserId) {
        currentUserAwarded = award.awarded
        currentUserRewardCoins = award.awarded
          ? COMMUNITY_REVIEW_REWARD_COINS
          : 0
        currentUserBalance = award.balance
      }
    }

    return {
      currentUserAwarded,
      currentUserRewardCoins,
      currentUserBalance,
    }
  }
}