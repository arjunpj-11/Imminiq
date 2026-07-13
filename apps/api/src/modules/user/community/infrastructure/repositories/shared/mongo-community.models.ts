import type { Model } from 'mongoose'

import { CommunityReviewVote } from '../../../../../../infrastructure/database/models/community-review-vote.model'
import { CommunityTrackerReview } from '../../../../../../infrastructure/database/models/community-tracker-review.model'
import { CommunityVerificationSubmission } from '../../../../../../infrastructure/database/models/community-verification-submission.model'
import { Tracker } from '../../../../../../infrastructure/database/models/tracker.model'
import { TrackerProgress } from '../../../../../../infrastructure/database/models/tracker-progress.model'
import { TrackerSubtopic } from '../../../../../../infrastructure/database/models/tracker-subtopic.model'
import { TrackerTopic } from '../../../../../../infrastructure/database/models/tracker-topic.model'
import { User } from '../../../../../../infrastructure/database/models/user.model'
import { UserProfile } from '../../../../../../infrastructure/database/models/user-profile.model'
import { CommunityTrackerLike } from '../../../../../../infrastructure/database/models/community-tracker-like.model'

type LooseMongoModel = Model<Record<string, unknown>>

export const CommunityTrackerModel = Tracker as unknown as LooseMongoModel
export const CommunityTrackerProgressModel =
  TrackerProgress as unknown as LooseMongoModel
export const CommunityTrackerTopicModel =
  TrackerTopic as unknown as LooseMongoModel
export const CommunityTrackerSubtopicModel =
  TrackerSubtopic as unknown as LooseMongoModel
export const CommunityUserModel = User as unknown as LooseMongoModel
export const CommunityUserProfileModel =
  UserProfile as unknown as LooseMongoModel
export const CommunityVerificationSubmissionModel =
  CommunityVerificationSubmission as unknown as LooseMongoModel
export const CommunityReviewVoteModel =
  CommunityReviewVote as unknown as LooseMongoModel
export const CommunityTrackerReviewModel =
  CommunityTrackerReview as unknown as LooseMongoModel
export const CommunityTrackerLikeModel = CommunityTrackerLike
