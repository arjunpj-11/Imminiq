import {
  CommunityMapper,
  type ICommunityMapper,
} from './application/mappers/community.mapper'
import {
  CommunityReviewMapper,
  type ICommunityReviewMapper,
} from './application/mappers/community-review.mapper'
import {
  CommunityVerificationPolicy,
  type ICommunityVerificationPolicy,
} from './application/policies/community-verification.policy'
import { CloneCommunityTrackerUseCase } from './application/use-cases/clone-community-tracker.usecase'
import { GetCommunityBrowseUseCase } from './application/use-cases/get-community-browse.usecase'
import { GetCommunityPersonalStatsUseCase } from './application/use-cases/get-community-personal-stats.usecase'
import { GetCommunityPublicTrackerUseCase } from './application/use-cases/get-community-public-tracker.usecase'
import { GetCommunityTopicsUseCase } from './application/use-cases/get-community-topics.usecase'
import { GetCommunityTrackersUseCase } from './application/use-cases/get-community-trackers.usecase'
import { GetVerificationDashboardUseCase } from './application/use-cases/get-verification-dashboard.usecase'
import { GetVerificationLeaderboardUseCase } from './application/use-cases/get-verification-leaderboard.usecase'
import { GetVerificationQueueUseCase } from './application/use-cases/get-verification-queue.usecase'
import { GetVerificationSubmissionUseCase } from './application/use-cases/get-verification-submission.usecase'
import { SubmitTrackerForVerificationUseCase } from './application/use-cases/submit-tracker-for-verification.usecase'
import { ToggleCommunityReviewHelpfulUseCase } from './application/use-cases/toggle-community-review-helpful.usecase'
import { ToggleCommunityTrackerLikeUseCase } from './application/use-cases/toggle-community-tracker-like.usecase'
import { UpsertCommunityTrackerReviewUseCase } from './application/use-cases/upsert-community-tracker-review.usecase'
import { VoteVerificationSubmissionUseCase } from './application/use-cases/vote-verification-submission.usecase'
import type { ICommunityCoinLedger } from './domain/services/community-coin-ledger.interface'
import { systemClock } from '../../infrastructure/time/system-clock'
import { activityCommunityGateway } from './infrastructure/gateways/activity-community.gateway'
import {
  mongoCommunityCoinLedger,
  mongoCommunityRepository,
  mongoCommunityReviewRepository,
} from './infrastructure'

export type CommunityUseCases = {
  getBrowse: GetCommunityBrowseUseCase
  getTrackers: GetCommunityTrackersUseCase
  getPublicTrackerDetail: GetCommunityPublicTrackerUseCase
  getPersonalStats: GetCommunityPersonalStatsUseCase
  getTopics: GetCommunityTopicsUseCase
  cloneTracker: CloneCommunityTrackerUseCase
  upsertTrackerReview: UpsertCommunityTrackerReviewUseCase
  toggleReviewHelpful: ToggleCommunityReviewHelpfulUseCase
  toggleTrackerLike: ToggleCommunityTrackerLikeUseCase
  getVerificationDashboard: GetVerificationDashboardUseCase
  getVerificationQueue: GetVerificationQueueUseCase
  getVerificationLeaderboard: GetVerificationLeaderboardUseCase
  getVerificationSubmission: GetVerificationSubmissionUseCase
  submitTrackerForVerification:
    SubmitTrackerForVerificationUseCase
  voteVerificationSubmission:
    VoteVerificationSubmissionUseCase
}

export type CommunityServiceHelpers = {
  mapper: ICommunityMapper
  reviewMapper: ICommunityReviewMapper
  verificationPolicy:
    ICommunityVerificationPolicy

  /*
   * Kept for public-composition compatibility.
   * Verification rewards no longer use this helper directly.
   */
  coinLedger: ICommunityCoinLedger
}

export type CommunityComposition = {
  useCases: CommunityUseCases
  helpers: CommunityServiceHelpers
}

export const createCommunityComposition =
  (): CommunityComposition => {
    const communityRepository =
      mongoCommunityRepository

    const communityReviewRepository =
      mongoCommunityReviewRepository

    const communityActivityRecorder =
      activityCommunityGateway

    const coinLedger =
      mongoCommunityCoinLedger

    const mapper =
      new CommunityMapper(systemClock)

    const reviewMapper =
      new CommunityReviewMapper()

    const verificationPolicy =
      new CommunityVerificationPolicy(systemClock)

    return {
      useCases: {
        getBrowse:
          new GetCommunityBrowseUseCase(
            communityRepository,
            mapper,
          ),

        getTrackers:
          new GetCommunityTrackersUseCase(
            communityRepository,
            mapper,
          ),

        getPublicTrackerDetail:
          new GetCommunityPublicTrackerUseCase(
            communityReviewRepository,
            reviewMapper,
          ),

        getPersonalStats:
          new GetCommunityPersonalStatsUseCase(
            communityRepository,
            mapper,
          ),

        getTopics:
          new GetCommunityTopicsUseCase(
            communityRepository,
          ),

        cloneTracker:
          new CloneCommunityTrackerUseCase(
            communityRepository,
            communityActivityRecorder,
            mapper,
          ),

        submitTrackerForVerification:
          new SubmitTrackerForVerificationUseCase(
            communityRepository,
            mapper,
          ),

        upsertTrackerReview:
          new UpsertCommunityTrackerReviewUseCase(
            communityReviewRepository,
            reviewMapper,
          ),

        toggleReviewHelpful:
          new ToggleCommunityReviewHelpfulUseCase(
            communityReviewRepository,
            reviewMapper,
          ),

        toggleTrackerLike:
          new ToggleCommunityTrackerLikeUseCase(
            communityReviewRepository,
          ),

        getVerificationDashboard:
          new GetVerificationDashboardUseCase(
            communityRepository,
            mapper,
          ),

        getVerificationQueue:
          new GetVerificationQueueUseCase(
            communityRepository,
            mapper,
          ),

        getVerificationLeaderboard:
          new GetVerificationLeaderboardUseCase(
            communityRepository,
            mapper,
          ),

        getVerificationSubmission:
          new GetVerificationSubmissionUseCase(
            communityRepository,
            mapper,
          ),

        voteVerificationSubmission:
          new VoteVerificationSubmissionUseCase(
            communityRepository,
            verificationPolicy,
            communityActivityRecorder,
            mapper,
          ),
      },

      helpers: {
        mapper,
        reviewMapper,
        verificationPolicy,
        coinLedger,
      },
    }
  }
