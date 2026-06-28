import type {
  CommunityTrackerListPayload,
  SubmitTrackerForVerificationPayload,
  VerificationQueuePayload,
  VoteVerificationSubmissionPayload,
} from './application/dtos/community.dto'
import type {
  ToggleCommunityReviewHelpfulPayload,
  UpsertCommunityTrackerReviewPayload,
} from './application/dtos/community-review.dto'
import {
  createCommunityComposition,
  type CommunityComposition,
} from './community.factory'

export class CommunityService {
  private readonly _useCases: CommunityComposition['useCases']
  private readonly _helpers: CommunityComposition['helpers']

  constructor(composition: CommunityComposition) {
    this._useCases = composition.useCases
    this._helpers = composition.helpers
  }

  getBrowse(payload: CommunityTrackerListPayload) {
    return this._useCases.getBrowse.execute(payload)
  }

  getTrackers(payload: CommunityTrackerListPayload) {
    return this._useCases.getTrackers.execute(payload)
  }

  getPublicTrackerDetail(trackerId: string, userId: string) {
    return this._useCases.getPublicTrackerDetail.execute(trackerId, userId)
  }

  getPersonalStats(userId: string) {
    return this._useCases.getPersonalStats.execute(userId)
  }

  getTopics() {
    return this._useCases.getTopics.execute()
  }

  cloneTracker(trackerId: string, userId: string) {
    return this._useCases.cloneTracker.execute(trackerId, userId)
  }

  submitTrackerForVerification(payload: SubmitTrackerForVerificationPayload) {
  return this._useCases.submitTrackerForVerification.execute(payload)
}

  upsertTrackerReview(payload: UpsertCommunityTrackerReviewPayload) {
    return this._useCases.upsertTrackerReview.execute(payload)
  }

  toggleReviewHelpful(payload: ToggleCommunityReviewHelpfulPayload) {
    return this._useCases.toggleReviewHelpful.execute(payload)
  }

  getVerificationDashboard(payload: VerificationQueuePayload) {
    return this._useCases.getVerificationDashboard.execute(payload)
  }

  getVerificationQueue(payload: VerificationQueuePayload) {
    return this._useCases.getVerificationQueue.execute(payload)
  }

  getVerificationLeaderboard(userId: string, limit?: number) {
    return this._useCases.getVerificationLeaderboard.execute(userId, limit)
  }

  getVerificationSubmission(submissionId: string, userId: string) {
    return this._useCases.getVerificationSubmission.execute(submissionId, userId)
  }

  voteVerificationSubmission(payload: VoteVerificationSubmissionPayload) {
    return this._useCases.voteVerificationSubmission.execute(payload)
  }

  toggleTrackerLike(payload: { trackerId: string; userId: string }) {
  return this._useCases.toggleTrackerLike.execute(payload)
}
}

export const communityService = new CommunityService(createCommunityComposition())
