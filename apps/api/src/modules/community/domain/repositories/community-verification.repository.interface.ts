import type { CommunityLeaderboardEntryEntity } from '../entities/community-leaderboard-entry.entity'
import type { CommunityReviewVoteEntity } from '../entities/community-review-vote.entity'
import type { CommunityVerificationSubmissionEntity } from '../entities/community-verification-submission.entity'
import type { VerificationVoteChoice } from '../value-objects/verification-vote-choice.vo'

export type FindVerificationQueueQuery = {
  userId: string
  page: number
  limit: number
}

export type VerificationQueueResult = {
  items: CommunityVerificationSubmissionEntity[]
  total: number
  page: number
  limit: number
  totalPages: number
}

export type CommunityVerificationStats = {
  awaiting: number
  reviewed: number
  totalEarnedCoins: number
  coinBalance: number
  queueCount: number
  rewardCoins: number
  activeReviewersThisWeek: number
}

export type SubmitTrackerForVerificationInput = {
  trackerId: string
  userId: string
  requiredVotes: number
  durationHours: number
  urgent?: boolean
}

export type CreateCommunityReviewVoteInput = {
  submissionId: string
  userId: string
  choice: VerificationVoteChoice
  reason?: string | null
  rewardCoins?: number
}

export interface CommunityVerificationRepositoryContract {
  submitTrackerForVerification(
    data: SubmitTrackerForVerificationInput,
  ): Promise<CommunityVerificationSubmissionEntity | null>

  getVerificationStats(
    userId: string,
  ): Promise<CommunityVerificationStats>

  getUserCoinBalance(
    userId: string,
  ): Promise<number>

  findVerificationQueue(
    query: FindVerificationQueueQuery,
  ): Promise<VerificationQueueResult>

  findVerificationSubmissionById(
    submissionId: string,
    userId: string,
  ): Promise<CommunityVerificationSubmissionEntity | null>

  findVoteBySubmissionAndUser(
    submissionId: string,
    userId: string,
  ): Promise<CommunityReviewVoteEntity | null>

  createVerificationVote(
    data: CreateCommunityReviewVoteInput,
  ): Promise<CommunityReviewVoteEntity>

  findUnrewardedMajorityVotes(
    submissionId: string,
    choice: VerificationVoteChoice,
  ): Promise<CommunityReviewVoteEntity[]>

  markVerificationVoteRewarded(
    voteId: string,
    rewardCoins: number,
  ): Promise<boolean>

  findVerificationLeaderboard(
    userId: string,
    limit: number,
  ): Promise<CommunityLeaderboardEntryEntity[]>
}
