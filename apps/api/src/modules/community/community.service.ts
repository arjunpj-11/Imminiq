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
  private readonly useCases: CommunityComposition['useCases']
  private readonly helpers: CommunityComposition['helpers']

  constructor(composition: CommunityComposition) {
    this.useCases = composition.useCases
    this.helpers = composition.helpers
  }

  getBrowse(payload: CommunityTrackerListPayload) {
    return this.useCases.getBrowse.execute(payload)
  }

  getTrackers(payload: CommunityTrackerListPayload) {
    return this.useCases.getTrackers.execute(payload)
  }

  getPublicTrackerDetail(trackerId: string, userId: string) {
    return this.useCases.getPublicTrackerDetail.execute(trackerId, userId)
  }

  getPersonalStats(userId: string) {
    return this.useCases.getPersonalStats.execute(userId)
  }

  getTopics() {
    return this.useCases.getTopics.execute()
  }

  cloneTracker(trackerId: string, userId: string) {
    return this.useCases.cloneTracker.execute(trackerId, userId)
  }

  submitTrackerForVerification(payload: SubmitTrackerForVerificationPayload) {
  return this.useCases.submitTrackerForVerification.execute(payload)
}

  upsertTrackerReview(payload: UpsertCommunityTrackerReviewPayload) {
    return this.useCases.upsertTrackerReview.execute(payload)
  }

  toggleReviewHelpful(payload: ToggleCommunityReviewHelpfulPayload) {
    return this.useCases.toggleReviewHelpful.execute(payload)
  }

  getVerificationDashboard(payload: VerificationQueuePayload) {
    return this.useCases.getVerificationDashboard.execute(payload)
  }

  getVerificationQueue(payload: VerificationQueuePayload) {
    return this.useCases.getVerificationQueue.execute(payload)
  }

  getVerificationLeaderboard(userId: string, limit?: number) {
    return this.useCases.getVerificationLeaderboard.execute(userId, limit)
  }

  getVerificationSubmission(submissionId: string, userId: string) {
    return this.useCases.getVerificationSubmission.execute(submissionId, userId)
  }

  voteVerificationSubmission(payload: VoteVerificationSubmissionPayload) {
    return this.useCases.voteVerificationSubmission.execute(payload)
  }

  toggleTrackerLike(payload: { trackerId: string; userId: string }) {
  return this.useCases.toggleTrackerLike.execute(payload)
}
}

export const communityService = new CommunityService(createCommunityComposition())
