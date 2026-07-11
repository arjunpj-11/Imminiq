import { activityService } from '../../../activity'
import type { ActivityRecorderContract } from '../../../activity/activity.service'
import type {
  CommunityActivityRecorderContract,
  RecordCommunityTrackerClonedActivityInput,
  RecordCommunityTrackerVerifiedActivityInput,
  RecordCommunityVerificationMajorityActivityInput,
  RecordCommunityVerificationVoteActivityInput,
} from '../../domain/services/community-activity.interface'

const normalizeText = (
  value: string | null | undefined,
  fallback: string,
  maximumLength: number,
): string => {
  const normalized = value?.trim() || fallback

  if (normalized.length <= maximumLength) {
    return normalized
  }

  return normalized.slice(0, maximumLength).trimEnd()
}

const normalizeReward = (value: number): number => {
  if (!Number.isFinite(value)) {
    return 0
  }

  return Math.max(0, Math.floor(value))
}

export class ActivityCommunityGateway
  implements CommunityActivityRecorderContract
{
  constructor(
    private readonly _activityRecorder: ActivityRecorderContract,
  ) {}
  async recordTrackerCloned(
    input: RecordCommunityTrackerClonedActivityInput,
  ): Promise<void> {
    const trackerTitle = normalizeText(
      input.trackerTitle,
      'Untitled tracker',
      150,
    )

    await this._activityRecorder.recordActivity({
      userId: input.userId,

      category: 'community',
      type: 'tracker_cloned',

      title: normalizeText(
        `Cloned ${trackerTitle}`,
        'Cloned community tracker',
        180,
      ),
      subtitle: 'Added to your tracker dashboard',

      xpAwarded: 0,
      xpBucket: 'none',
      coinsAwarded: 0,

      eventKey:
        `community:tracker-cloned:${input.clonedTrackerId}`,

      trackerId: input.clonedTrackerId,
      sourceUserId: input.sourceUserId,

      details: {},

      ...(input.occurredAt
        ? {
            occurredAt: input.occurredAt,
          }
        : {}),
    })
  }

  async recordVerificationVoteSubmitted(
    input: RecordCommunityVerificationVoteActivityInput,
  ): Promise<void> {
    const trackerTitle = normalizeText(
      input.trackerTitle,
      'Untitled tracker',
      150,
    )

    const xpAwarded = normalizeReward(
      input.xpAwarded,
    )

    await this._activityRecorder.recordActivity({
      userId: input.userId,

      category: 'community',
      type: 'community_review_completed',

      title: 'Community verification review completed',
      subtitle: trackerTitle,

      xpAwarded,
      xpBucket:
        xpAwarded > 0
          ? 'teacher'
          : 'none',
      coinsAwarded: 0,

      eventKey:
        `community:verification-vote:${input.voteId}`,

      trackerId: input.trackerId,
      sourceUserId: input.ownerId,

      details: {},

      ...(input.occurredAt
        ? {
            occurredAt: input.occurredAt,
          }
        : {}),
    })
  }

  async recordVerificationMajorityWon(
    input: RecordCommunityVerificationMajorityActivityInput,
  ): Promise<void> {
    const trackerTitle = normalizeText(
      input.trackerTitle,
      'Untitled tracker',
      150,
    )

    const xpAwarded = normalizeReward(
      input.xpAwarded,
    )

    const coinsAwarded = normalizeReward(
      input.coinsAwarded,
    )

    await this._activityRecorder.recordActivity({
      userId: input.userId,

      category: 'community',
      type: 'community_review_completed',

      title: 'Community majority reward earned',
      subtitle: trackerTitle,

      xpAwarded,
      xpBucket:
        xpAwarded > 0
          ? 'teacher'
          : 'none',
      coinsAwarded,

      eventKey:
        `community:verification-majority-won:${input.voteId}`,

      trackerId: input.trackerId,
      sourceUserId: input.ownerId,

      details: {
        milestoneValue: coinsAwarded,
      },
    })
  }

  async recordTrackerVerified(
    input: RecordCommunityTrackerVerifiedActivityInput,
  ): Promise<void> {
    const trackerTitle = normalizeText(
      input.trackerTitle,
      'Untitled tracker',
      150,
    )

    await this._activityRecorder.recordActivity({
      userId: input.ownerId,

      category: 'community',
      type: 'tracker_verified',

      title: normalizeText(
        `Verified ${trackerTitle}`,
        'Tracker verified',
        180,
      ),
      subtitle: 'Community verification approved',

      xpAwarded: 0,
      xpBucket: 'none',
      coinsAwarded: 0,

      eventKey:
        `community:tracker-verified:${input.submissionId}`,

      trackerId: input.trackerId,

      details: {},
    })
  }
}

export const activityCommunityGateway =
  new ActivityCommunityGateway(activityService)
