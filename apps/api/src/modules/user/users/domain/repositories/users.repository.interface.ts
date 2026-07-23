import type { IUserActivityRepository } from './user-activity.repository.interface';
import type { IUserBadgeRepository } from './user-badge.repository.interface';
import type { IUserProfileRepository } from './user-profile.repository.interface';
import type { IUserRelationshipRepository } from './user-relationship.repository.interface';
import type { IUserStreakRepository } from './user-streak.repository.interface';
import type { IUserTrackerRepository } from './user-tracker.repository.interface';
import type { IUserRepository } from './user.repository.interface';

export interface IUsersRepository
  extends IUserRepository,
    IUserProfileRepository,
    IUserActivityRepository,
    IUserBadgeRepository,
    IUserStreakRepository,
    IUserTrackerRepository,
    IUserRelationshipRepository {}

export type {
  FindRecentUserActivityInput,
  FindUserActivityFeedInput,
  UserActivityListResult,
} from './user-activity.repository.interface';

export type {
  EarnedUserBadgeListResult,
  FindEarnedUserBadgesPaginatedInput,
  UserBadgeShowcaseResult,
} from './user-badge.repository.interface';

export type {
  EnsureUserProfileInput,
  UpdateUserProfileInput,
} from './user-profile.repository.interface';

export type { GetRelationshipStateInput } from './user-relationship.repository.interface';

export type { FindUserStreakHistoryByYearInput } from './user-streak.repository.interface';

export type {
  FindPublishedTrackersInput,
  PublishedTrackerListResult,
} from './user-tracker.repository.interface';

export type { UpdateUserFullNameInput } from './user.repository.interface';
