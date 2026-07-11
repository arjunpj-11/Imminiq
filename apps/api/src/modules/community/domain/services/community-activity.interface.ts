export type RecordCommunityTrackerClonedActivityInput = {
  userId: string
  sourceUserId: string
  sourceTrackerId: string
  clonedTrackerId: string
  trackerTitle: string
  occurredAt?: Date
}

export type RecordCommunityVerificationVoteActivityInput = {
  userId: string
  ownerId: string
  trackerId: string
  submissionId: string
  voteId: string
  trackerTitle: string
  xpAwarded: number
  occurredAt?: Date
}

export type RecordCommunityVerificationMajorityActivityInput = {
  userId: string
  ownerId: string
  trackerId: string
  submissionId: string
  voteId: string
  trackerTitle: string
  xpAwarded: number
  coinsAwarded: number
}

export type RecordCommunityTrackerVerifiedActivityInput = {
  ownerId: string
  trackerId: string
  submissionId: string
  trackerTitle: string
}

export interface CommunityActivityRecorderContract {
  recordTrackerCloned(
    input: RecordCommunityTrackerClonedActivityInput,
  ): Promise<void>

  recordVerificationVoteSubmitted(
    input: RecordCommunityVerificationVoteActivityInput,
  ): Promise<void>

  recordVerificationMajorityWon(
    input: RecordCommunityVerificationMajorityActivityInput,
  ): Promise<void>

  recordTrackerVerified(
    input: RecordCommunityTrackerVerifiedActivityInput,
  ): Promise<void>
}
