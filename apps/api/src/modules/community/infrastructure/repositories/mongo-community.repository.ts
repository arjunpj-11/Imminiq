import type { ICommunityRepository } from '../../domain/repositories/community.repository.interface'
import type { UpsertCommunityTrackerReviewInput } from '../../domain/repositories/community-review.repository.interface'
import type { FindCommunityTrackersQuery } from '../../domain/repositories/community-tracker.repository.interface'
import type {
  CreateCommunityReviewVoteInput,
  FindVerificationQueueQuery,
  SubmitTrackerForVerificationInput,
} from '../../domain/repositories/community-verification.repository.interface'
import type { VerificationVoteChoice } from '../../domain/value-objects/verification-vote-choice.vo'
import { MongoCommunityReviewRepository } from './internal/mongo-community-review.repository'
import { MongoCommunityTrackerRepository } from './internal/mongo-community-tracker.repository'
import { MongoCommunityVerificationRepository } from './internal/mongo-community-verification.repository'
import { MongoCommunityErrorMapper } from './shared/mongo-community-error.mapper'
import { MongoCommunityMapper } from './shared/mongo-community.mapper'

type MongoCommunityRepositoryDependencies = {
  trackerRepository: MongoCommunityTrackerRepository
  verificationRepository: MongoCommunityVerificationRepository
  reviewRepository: MongoCommunityReviewRepository
}

export class MongoCommunityRepository
  implements ICommunityRepository
{
  private readonly _trackerRepository:
    MongoCommunityTrackerRepository

  private readonly _verificationRepository:
    MongoCommunityVerificationRepository

  private readonly _reviewRepository:
    MongoCommunityReviewRepository

  constructor(
    mapper: MongoCommunityMapper =
      new MongoCommunityMapper(),

    errorMapper: MongoCommunityErrorMapper =
      new MongoCommunityErrorMapper(),

    dependencies:
      Partial<MongoCommunityRepositoryDependencies> = {},
  ) {
    this._trackerRepository =
      dependencies.trackerRepository ??
      new MongoCommunityTrackerRepository(
        mapper,
        errorMapper,
      )

    this._verificationRepository =
      dependencies.verificationRepository ??
      new MongoCommunityVerificationRepository(
        mapper,
        errorMapper,
      )

    this._reviewRepository =
      dependencies.reviewRepository ??
      new MongoCommunityReviewRepository(mapper)
  }

  async findPublicTrackers(
    query: FindCommunityTrackersQuery,
  ) {
    return this._trackerRepository
      .findPublicTrackers(query)
  }

  async findCommunityTrackerById(
    trackerId: string,
    userId: string,
  ) {
    return this._trackerRepository
      .findCommunityTrackerById(
        trackerId,
        userId,
      )
  }

  async cloneTrackerForUser(
    trackerId: string,
    userId: string,
  ) {
    return this._trackerRepository
      .cloneTrackerForUser(
        trackerId,
        userId,
      )
  }

  async submitTrackerForVerification(
    data: SubmitTrackerForVerificationInput,
  ) {
    return this._verificationRepository
      .submitTrackerForVerification(data)
  }

  async getPersonalStats(userId: string) {
    return this._trackerRepository
      .getPersonalStats(userId)
  }

  async findAvailableTopics() {
    return this._trackerRepository
      .findAvailableTopics()
  }

  async getVerificationStats(userId: string) {
    return this._verificationRepository
      .getVerificationStats(userId)
  }

  async getUserCoinBalance(userId: string) {
    return this._verificationRepository
      .getUserCoinBalance(userId)
  }

  async findVerificationQueue(
    query: FindVerificationQueueQuery,
  ) {
    return this._verificationRepository
      .findVerificationQueue(query)
  }

  async findVerificationSubmissionById(
    submissionId: string,
    userId: string,
  ) {
    return this._verificationRepository
      .findVerificationSubmissionById(
        submissionId,
        userId,
      )
  }

  async findVoteBySubmissionAndUser(
    submissionId: string,
    userId: string,
  ) {
    return this._verificationRepository
      .findVoteBySubmissionAndUser(
        submissionId,
        userId,
      )
  }

  async createVerificationVote(
    data: CreateCommunityReviewVoteInput,
  ) {
    return this._verificationRepository
      .createVerificationVote(data)
  }

  async findUnrewardedMajorityVotes(
    submissionId: string,
    choice: VerificationVoteChoice,
  ) {
    return this._verificationRepository
      .findUnrewardedMajorityVotes(
        submissionId,
        choice,
      )
  }

  async markVerificationVoteRewarded(
    voteId: string,
    rewardCoins: number,
  ): Promise<boolean> {
    return this._verificationRepository
      .markVerificationVoteRewarded(
        voteId,
        rewardCoins,
      )
  }

  async findVerificationLeaderboard(
    userId: string,
    limit: number,
  ) {
    return this._verificationRepository
      .findVerificationLeaderboard(
        userId,
        limit,
      )
  }

  async findPublicTrackerDetail(
    trackerId: string,
    userId: string,
  ) {
    return this._reviewRepository
      .findPublicTrackerDetail(
        trackerId,
        userId,
      )
  }

  async upsertTrackerReview(
    input: UpsertCommunityTrackerReviewInput,
  ) {
    return this._reviewRepository
      .upsertTrackerReview(input)
  }

  async toggleReviewHelpful(
    reviewId: string,
    userId: string,
  ) {
    return this._reviewRepository
      .toggleReviewHelpful(
        reviewId,
        userId,
      )
  }

  async toggleTrackerLike(
    trackerId: string,
    userId: string,
  ) {
    return this._reviewRepository
      .toggleTrackerLike(
        trackerId,
        userId,
      )
  }
}

export const mongoCommunityRepository =
  new MongoCommunityRepository()

export {
  MongoCommunityReviewRepository,
  mongoCommunityReviewRepository,
} from './internal/mongo-community-review.repository'
