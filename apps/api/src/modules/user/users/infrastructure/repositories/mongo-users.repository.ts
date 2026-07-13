import type { EarnedUserBadgeEntity } from '../../domain/entities/earned-user-badge.entity'
import type { PublishedTrackerEntity } from '../../domain/entities/published-tracker.entity'
import type { UserActivityEntity } from '../../domain/entities/user-activity.entity'
import type { UserBadgeEntity } from '../../domain/entities/user-badge.entity'
import type { UserPrivacySettingsEntity } from '../../domain/entities/user-privacy-settings.entity'
import type { UserProfileEntity } from '../../domain/entities/user-profile.entity'
import type { UserStreakDayEntity } from '../../domain/entities/user-streak-day.entity'
import type { UserStreakSnapshotEntity } from '../../domain/entities/user-streak-snapshot.entity'
import type { UserEntity } from '../../domain/entities/user.entity'
import type {
  EnsureUserProfileInput,
  FindEarnedUserBadgesPaginatedInput,
  FindPublishedTrackersInput,
  FindRecentUserActivityInput,
  FindUserActivityFeedInput,
  FindUserStreakHistoryByYearInput,
  GetRelationshipStateInput,
  UpdateUserFullNameInput,
  UpdateUserProfileInput,
  IUsersRepository,
} from '../../domain/repositories/users.repository.interface'
import type { RelationshipState } from '../../domain/value-objects/relationship-state.vo'
import type { UserIdInput } from '../../domain/value-objects/user-id.vo'
import { MongoUsersActivityRepository } from './internal/mongo-users-activity.repository'
import { MongoUsersBadgeRepository } from './internal/mongo-users-badge.repository'
import { MongoUsersProfileRepository } from './internal/mongo-users-profile.repository'
import { MongoUsersRelationshipRepository } from './internal/mongo-users-relationship.repository'
import { MongoUsersStreakRepository } from './internal/mongo-users-streak.repository'
import { MongoUsersTrackerRepository } from './internal/mongo-users-tracker.repository'
import { MongoUsersUserRepository } from './internal/mongo-users-user.repository'
import { MongoUsersMapper } from './shared/mongo-users.mapper'

type MongoUsersRepositoryDependencies = {
  userRepository: MongoUsersUserRepository
  profileRepository: MongoUsersProfileRepository
  activityRepository: MongoUsersActivityRepository
  badgeRepository: MongoUsersBadgeRepository
  streakRepository: MongoUsersStreakRepository
  trackerRepository: MongoUsersTrackerRepository
  relationshipRepository: MongoUsersRelationshipRepository
}

export class MongoUsersRepository implements IUsersRepository {
  private readonly _userRepository: MongoUsersUserRepository
  private readonly _profileRepository: MongoUsersProfileRepository
  private readonly _activityRepository: MongoUsersActivityRepository
  private readonly _badgeRepository: MongoUsersBadgeRepository
  private readonly _streakRepository: MongoUsersStreakRepository
  private readonly _trackerRepository: MongoUsersTrackerRepository
  private readonly _relationshipRepository: MongoUsersRelationshipRepository

  constructor(
    mapper: MongoUsersMapper = new MongoUsersMapper(),
    dependencies: Partial<MongoUsersRepositoryDependencies> = {},
  ) {
    this._userRepository =
      dependencies.userRepository ??
      new MongoUsersUserRepository(mapper)

    this._profileRepository =
      dependencies.profileRepository ??
      new MongoUsersProfileRepository(mapper)

    this._activityRepository =
      dependencies.activityRepository ??
      new MongoUsersActivityRepository(mapper)

    this._badgeRepository =
      dependencies.badgeRepository ??
      new MongoUsersBadgeRepository(mapper)

    this._streakRepository =
      dependencies.streakRepository ??
      new MongoUsersStreakRepository(mapper)

    this._trackerRepository =
      dependencies.trackerRepository ??
      new MongoUsersTrackerRepository(mapper)

    this._relationshipRepository =
      dependencies.relationshipRepository ??
      new MongoUsersRelationshipRepository()
  }

  findById(userId: string): Promise<UserEntity | null> {
    return this._userRepository.findById(userId)
  }

  findByUsername(username: string): Promise<UserEntity | null> {
    return this._userRepository.findByUsername(username)
  }

  getProgressionRanks(userId: string) {
    return this._userRepository.getProgressionRanks(userId)
  }

  updateFullName(
    input: UpdateUserFullNameInput,
  ): Promise<UserEntity | null> {
    return this._userRepository.updateFullName(input)
  }

  findByUserId(userId: UserIdInput): Promise<UserProfileEntity | null> {
    return this._profileRepository.findByUserId(userId)
  }

  findPrivacySettings(
    userId: UserIdInput,
  ): Promise<UserPrivacySettingsEntity | null> {
    return this._profileRepository.findPrivacySettings(userId)
  }

  ensureForUser(input: EnsureUserProfileInput): Promise<UserProfileEntity> {
    return this._profileRepository.ensureForUser(input)
  }

  updateByUserId(
    input: UpdateUserProfileInput,
  ): Promise<UserProfileEntity | null> {
    return this._profileRepository.updateByUserId(input)
  }

  findActivityFeed(
    input: FindUserActivityFeedInput,
  ): Promise<{ items: UserActivityEntity[]; total: number }> {
    return this._activityRepository.findActivityFeed(input)
  }

  findRecentActivity(
    input: FindRecentUserActivityInput,
  ): Promise<UserActivityEntity[]> {
    return this._activityRepository.findRecentActivity(input)
  }

  findBadgeShowcase(userId: UserIdInput): Promise<{
    catalog: UserBadgeEntity[]
    earned: EarnedUserBadgeEntity[]
  }> {
    return this._badgeRepository.findBadgeShowcase(userId)
  }

  findEarnedBadgesPaginated(
    input: FindEarnedUserBadgesPaginatedInput,
  ): Promise<{ items: EarnedUserBadgeEntity[]; total: number }> {
    return this._badgeRepository.findEarnedBadgesPaginated(input)
  }

  findLatestSnapshot(
    userId: UserIdInput,
  ): Promise<UserStreakSnapshotEntity | null> {
    return this._streakRepository.findLatestSnapshot(userId)
  }

  findHistoryByYear(
    input: FindUserStreakHistoryByYearInput,
  ): Promise<UserStreakDayEntity[]> {
    return this._streakRepository.findHistoryByYear(input)
  }

  findPublishedTrackers(
    input: FindPublishedTrackersInput,
  ): Promise<{ items: PublishedTrackerEntity[]; total: number }> {
    return this._trackerRepository.findPublishedTrackers(input)
  }

  getPublishedTrackerMetrics(ownerId: UserIdInput) {
    return this._trackerRepository.getPublishedTrackerMetrics(ownerId)
  }

  getRelationshipState(
    input: GetRelationshipStateInput,
  ): Promise<RelationshipState> {
    return this._relationshipRepository.getRelationshipState(input)
  }
}

export const mongoUsersRepository = new MongoUsersRepository()
