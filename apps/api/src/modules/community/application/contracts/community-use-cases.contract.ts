import type * as Application from '../index'
export type CommunityUseCases = {
  getBrowse: Application.IGetCommunityBrowseUseCase
  getTrackers: Application.IGetCommunityTrackersUseCase
  getPublicTrackerDetail: Application.IGetCommunityPublicTrackerUseCase
  getPersonalStats: Application.IGetCommunityPersonalStatsUseCase
  getTopics: Application.IGetCommunityTopicsUseCase
  cloneTracker: Application.ICloneCommunityTrackerUseCase
  upsertTrackerReview: Application.IUpsertCommunityTrackerReviewUseCase
  toggleReviewHelpful: Application.IToggleCommunityReviewHelpfulUseCase
  toggleTrackerLike: Application.IToggleCommunityTrackerLikeUseCase
  getVerificationDashboard: Application.IGetVerificationDashboardUseCase
  getVerificationQueue: Application.IGetVerificationQueueUseCase
  getVerificationLeaderboard: Application.IGetVerificationLeaderboardUseCase
  getVerificationSubmission: Application.IGetVerificationSubmissionUseCase
  submitTrackerForVerification: Application.ISubmitTrackerForVerificationUseCase
  voteVerificationSubmission: Application.IVoteVerificationSubmissionUseCase
}
