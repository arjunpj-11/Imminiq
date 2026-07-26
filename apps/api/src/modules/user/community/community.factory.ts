import type { CommunityUseCases } from './application/community-use-cases.contract';
import { CommunityMapper, type ICommunityMapper } from './application/community.mapper';
import {
  CommunityReviewMapper,
  type ICommunityReviewMapper,
} from './application/community-review.mapper';
import {
  CommunityVerificationPolicy,
  type ICommunityVerificationPolicy,
} from './application/community-verification.policy';
import { CloneCommunityTrackerUseCase } from './application/use-cases/clone-community-tracker.usecase';
import { GetCommunityBrowseUseCase } from './application/use-cases/get-community-browse.usecase';
import { GetCommunityPublicTrackerUseCase } from './application/use-cases/get-community-public-tracker.usecase';
import { GetVerificationDashboardUseCase } from './application/use-cases/get-verification-dashboard.usecase';
import { GetVerificationSubmissionUseCase } from './application/use-cases/get-verification-submission.usecase';
import { SubmitTrackerForVerificationUseCase } from './application/use-cases/submit-tracker-for-verification.usecase';
import { ToggleCommunityReviewHelpfulUseCase } from './application/use-cases/toggle-community-review-helpful.usecase';
import { ToggleCommunityTrackerLikeUseCase } from './application/use-cases/toggle-community-tracker-like.usecase';
import { UpsertCommunityTrackerReviewUseCase } from './application/use-cases/upsert-community-tracker-review.usecase';
import { VoteVerificationSubmissionUseCase } from './application/use-cases/vote-verification-submission.usecase';
import type { ICommunityCoinLedger } from './domain/services/community-coin-ledger.interface';
import { systemClock } from '../../../infrastructure/time/system-clock';
import { ActivityCommunityGateway } from './infrastructure/gateways/activity-community.gateway';
import type { IRecordUserActivityUseCase } from '../activity';
import {
  mongoCommunityCoinLedger,
  mongoCommunityRepository,
  mongoCommunityReviewRepository,
} from './infrastructure';
import { mongoPlatformPolicyReader } from '../../../infrastructure/mongo-platform-policy.reader';
import {
  CommunityVerificationRewardService,
  type ICommunityVerificationRewardService,
} from './application/services/community-verification-reward.service';

export type CommunityServiceHelpers = {
  mapper: ICommunityMapper;
  reviewMapper: ICommunityReviewMapper;
  verificationPolicy: ICommunityVerificationPolicy;

  /*
   * Kept for public-composition compatibility.
   * Verification rewards no longer use this helper directly.
   */
  coinLedger: ICommunityCoinLedger;
  personalCloneProvisioner: {
    ensureClone(input: {
      trackerId: string;
      userId: string;
      bypassClonePermission?: boolean;
    }): Promise<boolean>;
  };
  verificationRewards: ICommunityVerificationRewardService;
};

export type CommunityComposition = {
  useCases: CommunityUseCases;
  helpers: CommunityServiceHelpers;
};

export const createCommunityComposition = (
  activityRecorder: IRecordUserActivityUseCase
): CommunityComposition => {
  const communityRepository = mongoCommunityRepository;

  const communityReviewRepository = mongoCommunityReviewRepository;

  const communityActivityRecorder = new ActivityCommunityGateway(activityRecorder);

  const coinLedger = mongoCommunityCoinLedger;

  const mapper = new CommunityMapper(systemClock);

  const reviewMapper = new CommunityReviewMapper();

  const verificationPolicy = new CommunityVerificationPolicy(systemClock);
  const verificationRewards = new CommunityVerificationRewardService(
    communityRepository,
    communityActivityRecorder,
    mongoPlatformPolicyReader
  );

  const personalCloneProvisioner: CommunityServiceHelpers['personalCloneProvisioner'] = {
    ensureClone: async ({ trackerId, userId, bypassClonePermission }) =>
      Boolean(
        await communityRepository.cloneTrackerForUser(trackerId, userId, {
          bypassClonePermission,
        })
      ),
  };

  return {
    useCases: {
      getBrowse: new GetCommunityBrowseUseCase(
        communityRepository,
        mapper,
        mongoPlatformPolicyReader
      ),

      getPublicTrackerDetail: new GetCommunityPublicTrackerUseCase(
        communityReviewRepository,
        reviewMapper
      ),

      cloneTracker: new CloneCommunityTrackerUseCase(
        communityRepository,
        communityActivityRecorder,
        mapper
      ),

      submitTrackerForVerification: new SubmitTrackerForVerificationUseCase(
        communityRepository,
        mapper,
        mongoPlatformPolicyReader
      ),

      upsertTrackerReview: new UpsertCommunityTrackerReviewUseCase(
        communityReviewRepository,
        reviewMapper
      ),

      toggleReviewHelpful: new ToggleCommunityReviewHelpfulUseCase(
        communityReviewRepository,
        reviewMapper
      ),

      toggleTrackerLike: new ToggleCommunityTrackerLikeUseCase(communityReviewRepository),

      getVerificationDashboard: new GetVerificationDashboardUseCase(
        communityRepository,
        mapper,
        mongoPlatformPolicyReader
      ),

      getVerificationSubmission: new GetVerificationSubmissionUseCase(communityRepository, mapper),

      voteVerificationSubmission: new VoteVerificationSubmissionUseCase(
        communityRepository,
        verificationPolicy,
        communityActivityRecorder,
        mapper,
        mongoPlatformPolicyReader,
        verificationRewards
      ),
    },

    helpers: {
      mapper,
      reviewMapper,
      verificationPolicy,
      coinLedger,
      personalCloneProvisioner,
      verificationRewards,
    },
  };
};
