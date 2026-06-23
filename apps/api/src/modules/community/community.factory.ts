// apps/api/src/modules/community/community.factory.ts

import {
  CommunityMapper,
  type CommunityMapperContract,
} from './application/mappers/community.mapper'
import {
  CommunityVerificationPolicyService,
  type CommunityVerificationPolicyContract,
} from './application/policies/community-verification.policy'
import { CloneCommunityTrackerUseCase } from './application/use-cases/clone-community-tracker.usecase'
import { GetCommunityBrowseUseCase } from './application/use-cases/get-community-browse.usecase'
import { GetCommunityPersonalStatsUseCase } from './application/use-cases/get-community-personal-stats.usecase'
import { GetCommunityTopicsUseCase } from './application/use-cases/get-community-topics.usecase'
import { GetCommunityTrackersUseCase } from './application/use-cases/get-community-trackers.usecase'
import { GetVerificationDashboardUseCase } from './application/use-cases/get-verification-dashboard.usecase'
import { GetVerificationLeaderboardUseCase } from './application/use-cases/get-verification-leaderboard.usecase'
import { GetVerificationQueueUseCase } from './application/use-cases/get-verification-queue.usecase'
import { GetVerificationSubmissionUseCase } from './application/use-cases/get-verification-submission.usecase'
import { SubmitTrackerForVerificationUseCase } from './application/use-cases/submit-tracker-for-verification.usecase'
import { VoteVerificationSubmissionUseCase } from './application/use-cases/vote-verification-submission.usecase'
import type { CommunityCoinLedgerContract } from './domain/services/community-coin-ledger.service.interface'
import {
  mongoCommunityCoinLedgerService,
  mongoCommunityRepository,
} from './infrastructure'

export type CommunityUseCases = {
  getBrowse: GetCommunityBrowseUseCase
  getTrackers: GetCommunityTrackersUseCase
  getPersonalStats: GetCommunityPersonalStatsUseCase
  getTopics: GetCommunityTopicsUseCase
  cloneTracker: CloneCommunityTrackerUseCase
  submitTrackerForVerification: SubmitTrackerForVerificationUseCase
  getVerificationDashboard: GetVerificationDashboardUseCase
  getVerificationQueue: GetVerificationQueueUseCase
  getVerificationLeaderboard: GetVerificationLeaderboardUseCase
  getVerificationSubmission: GetVerificationSubmissionUseCase
  voteVerificationSubmission: VoteVerificationSubmissionUseCase
}

export type CommunityServiceHelpers = {
  mapper: CommunityMapperContract
  verificationPolicy: CommunityVerificationPolicyContract
  coinLedger: CommunityCoinLedgerContract
}

export type CommunityComposition = {
  useCases: CommunityUseCases
  helpers: CommunityServiceHelpers
}

export const createCommunityComposition = (): CommunityComposition => {
  const communityRepository = mongoCommunityRepository
  const coinLedger = mongoCommunityCoinLedgerService
  const mapper = new CommunityMapper()
  const verificationPolicy = new CommunityVerificationPolicyService()

  return {
    useCases: {
      getBrowse: new GetCommunityBrowseUseCase(communityRepository, mapper),
      getTrackers: new GetCommunityTrackersUseCase(communityRepository, mapper),
      getPersonalStats: new GetCommunityPersonalStatsUseCase(
        communityRepository,
        mapper,
      ),
      getTopics: new GetCommunityTopicsUseCase(communityRepository),
      cloneTracker: new CloneCommunityTrackerUseCase(
        communityRepository,
        mapper,
      ),
      submitTrackerForVerification: new SubmitTrackerForVerificationUseCase(
        communityRepository,
        mapper,
      ),
      getVerificationDashboard: new GetVerificationDashboardUseCase(
        communityRepository,
        mapper,
      ),
      getVerificationQueue: new GetVerificationQueueUseCase(
        communityRepository,
        mapper,
      ),
      getVerificationLeaderboard: new GetVerificationLeaderboardUseCase(
        communityRepository,
        mapper,
      ),
      getVerificationSubmission: new GetVerificationSubmissionUseCase(
        communityRepository,
        mapper,
      ),
      voteVerificationSubmission: new VoteVerificationSubmissionUseCase(
        communityRepository,
        coinLedger,
        verificationPolicy,
        mapper,
      ),
    },
    helpers: {
      mapper,
      verificationPolicy,
      coinLedger,
    },
  }
}