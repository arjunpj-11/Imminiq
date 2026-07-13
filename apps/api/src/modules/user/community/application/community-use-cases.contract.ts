import type * as Application from './index';
export type CommunityUseCases = {
  getBrowse: Application.IGetCommunityBrowseUseCase;
  getPublicTrackerDetail: Application.IGetCommunityPublicTrackerUseCase;
  cloneTracker: Application.ICloneCommunityTrackerUseCase;
  upsertTrackerReview: Application.IUpsertCommunityTrackerReviewUseCase;
  toggleReviewHelpful: Application.IToggleCommunityReviewHelpfulUseCase;
  toggleTrackerLike: Application.IToggleCommunityTrackerLikeUseCase;
  getVerificationDashboard: Application.IGetVerificationDashboardUseCase;
  getVerificationSubmission: Application.IGetVerificationSubmissionUseCase;
  submitTrackerForVerification: Application.ISubmitTrackerForVerificationUseCase;
  voteVerificationSubmission: Application.IVoteVerificationSubmissionUseCase;
};
