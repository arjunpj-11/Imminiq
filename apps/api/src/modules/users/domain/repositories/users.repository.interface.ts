import type { UserActivityRepositoryContract } from './user-activity.repository.interface'
import type { UserBadgeRepositoryContract } from './user-badge.repository.interface'
import type { UserProfileRepositoryContract } from './user-profile.repository.interface'
import type { UserRelationshipRepositoryContract } from './user-relationship.repository.interface'
import type { UserStreakRepositoryContract } from './user-streak.repository.interface'
import type { UserTrackerRepositoryContract } from './user-tracker.repository.interface'
import type { UserRepositoryContract } from './user.repository.interface'

export interface UsersRepositoryContract
  extends UserRepositoryContract,
    UserProfileRepositoryContract,
    UserActivityRepositoryContract,
    UserBadgeRepositoryContract,
    UserStreakRepositoryContract,
    UserTrackerRepositoryContract,
    UserRelationshipRepositoryContract {}

export type {
  FindRecentUserActivityInput,
  FindUserActivityFeedInput,
  UserActivityListResult,
} from './user-activity.repository.interface'

export type {
  EarnedUserBadgeListResult,
  FindEarnedUserBadgesPaginatedInput,
  UserBadgeShowcaseResult,
} from './user-badge.repository.interface'

export type {
  EnsureUserProfileInput,
  UpdateUserProfileInput,
} from './user-profile.repository.interface'

export type { GetRelationshipStateInput } from './user-relationship.repository.interface'

export type { FindUserStreakHistoryByYearInput } from './user-streak.repository.interface'

export type {
  FindPublishedTrackersInput,
  PublishedTrackerListResult,
} from './user-tracker.repository.interface'

export type { UpdateUserFullNameInput } from './user.repository.interface'