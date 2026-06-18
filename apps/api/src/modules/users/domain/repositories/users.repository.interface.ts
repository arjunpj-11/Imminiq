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
