import type * as Application from '../index'
export type CommunityUseCases = {
  getBrowse: Application.GetCommunityBrowseUseCase
  getTrackers: Application.GetCommunityTrackersUseCase
  getPublicTrackerDetail: Application.GetCommunityPublicTrackerUseCase
  getPersonalStats: Application.GetCommunityPersonalStatsUseCase
  getTopics: Application.GetCommunityTopicsUseCase
  cloneTracker: Application.CloneCommunityTrackerUseCase
  upsertTrackerReview: Application.UpsertCommunityTrackerReviewUseCase
  toggleReviewHelpful: Application.ToggleCommunityReviewHelpfulUseCase
  toggleTrackerLike: Application.ToggleCommunityTrackerLikeUseCase
  getVerificationDashboard: Application.GetVerificationDashboardUseCase
  getVerificationQueue: Application.GetVerificationQueueUseCase
  getVerificationLeaderboard: Application.GetVerificationLeaderboardUseCase
  getVerificationSubmission: Application.GetVerificationSubmissionUseCase
  submitTrackerForVerification: Application.SubmitTrackerForVerificationUseCase
  voteVerificationSubmission: Application.VoteVerificationSubmissionUseCase
}
