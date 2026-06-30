import type { DashboardActivityIntensityEntity } from '../../domain/entities/dashboard-activity-intensity.entity'
import type { DashboardBattleEntity } from '../../domain/entities/dashboard-battle.entity'
import type { DashboardFriendEntity } from '../../domain/entities/dashboard-friend.entity'
import type { DashboardProfileEntity } from '../../domain/entities/dashboard-profile.entity'
import type { DashboardRecentActivityEntity } from '../../domain/entities/dashboard-recent-activity.entity'
import type { DashboardStatsEntity } from '../../domain/entities/dashboard-stats.entity'
import type { DashboardStreakEntity } from '../../domain/entities/dashboard-streak.entity'
import type { DashboardTrackerSummaryEntity } from '../../domain/entities/dashboard-tracker-summary.entity'
import type { DashboardUserEntity } from '../../domain/entities/dashboard-user.entity'
import type { GetRecentBattlesInput } from '../../domain/repositories/dashboard-battle.repository.interface'
import type { GetFriendsHubInput } from '../../domain/repositories/dashboard-friend.repository.interface'
import type { GetRecentActivityInput } from '../../domain/repositories/dashboard-notification.repository.interface'
import type { DashboardRepositoryContract } from '../../domain/repositories/dashboard.repository.interface'
import type { GetActivityIntensityInput } from '../../domain/repositories/dashboard-streak.repository.interface'
import type { DashboardRecommendationContext } from '../../domain/value-objects/dashboard-recommendation-context.vo'
import { MongoDashboardBattleRepository } from './internal/mongo-dashboard-battle.repository'
import { MongoDashboardFriendRepository } from './internal/mongo-dashboard-friend.repository'
import { MongoDashboardNotificationRepository } from './internal/mongo-dashboard-notification.repository'
import { MongoDashboardStreakRepository } from './internal/mongo-dashboard-streak.repository'
import { MongoDashboardTrackerRepository } from './internal/mongo-dashboard-tracker.repository'
import { MongoDashboardUserRepository } from './internal/mongo-dashboard-user.repository'
import { MongoDashboardMapper } from './shared/mongo-dashboard.mapper'

type MongoDashboardRepositoryDependencies = {
  userRepository: MongoDashboardUserRepository
  streakRepository: MongoDashboardStreakRepository
  trackerRepository: MongoDashboardTrackerRepository
  notificationRepository: MongoDashboardNotificationRepository
  battleRepository: MongoDashboardBattleRepository
  friendRepository: MongoDashboardFriendRepository
}

export class MongoDashboardRepository implements DashboardRepositoryContract {
  private readonly _userRepository: MongoDashboardUserRepository
  private readonly _streakRepository: MongoDashboardStreakRepository
  private readonly _trackerRepository: MongoDashboardTrackerRepository
  private readonly _notificationRepository: MongoDashboardNotificationRepository
  private readonly _battleRepository: MongoDashboardBattleRepository
  private readonly _friendRepository: MongoDashboardFriendRepository

  constructor(
    mapper: MongoDashboardMapper = new MongoDashboardMapper(),
    dependencies: Partial<MongoDashboardRepositoryDependencies> = {},
  ) {
    this._userRepository =
      dependencies.userRepository ??
      new MongoDashboardUserRepository(mapper)

    this._streakRepository =
      dependencies.streakRepository ??
      new MongoDashboardStreakRepository(mapper)

    this._trackerRepository =
      dependencies.trackerRepository ??
      new MongoDashboardTrackerRepository(mapper)

    this._notificationRepository =
      dependencies.notificationRepository ??
      new MongoDashboardNotificationRepository(mapper)

    this._battleRepository =
      dependencies.battleRepository ??
      new MongoDashboardBattleRepository(mapper)

    this._friendRepository =
      dependencies.friendRepository ??
      new MongoDashboardFriendRepository(mapper)
  }

  async findUserById(userId: string): Promise<DashboardUserEntity | null> {
    return this._userRepository.findUserById(userId)
  }

  async findProfileByUserId(
    userId: string,
  ): Promise<DashboardProfileEntity | null> {
    return this._userRepository.findProfileByUserId(userId)
  }

  async getStreakData(userId: string): Promise<DashboardStreakEntity> {
    return this._streakRepository.getStreakData(userId)
  }

  async getTrackerOverview(
    userId: string,
  ): Promise<DashboardTrackerSummaryEntity> {
    return this._trackerRepository.getTrackerOverview(userId)
  }

  async getAggregatedStats(userId: string): Promise<DashboardStatsEntity> {
    return this._trackerRepository.getAggregatedStats(userId)
  }

  async getRecentActivity(
    input: GetRecentActivityInput,
  ): Promise<DashboardRecentActivityEntity[]> {
    return this._notificationRepository.getRecentActivity(input)
  }

  async getUnreadNotificationCount(userId: string): Promise<number> {
    return this._notificationRepository.getUnreadNotificationCount(userId)
  }

  async getActivityIntensity(
    input: GetActivityIntensityInput,
  ): Promise<DashboardActivityIntensityEntity[]> {
    return this._streakRepository.getActivityIntensity(input)
  }

  async getRecentBattles(
    input: GetRecentBattlesInput,
  ): Promise<DashboardBattleEntity[]> {
    return this._battleRepository.getRecentBattles(input)
  }

  async getFriendsHub(
    input: GetFriendsHubInput,
  ): Promise<DashboardFriendEntity[]> {
    return this._friendRepository.getFriendsHub(input)
  }

  async getRecommendationContext(
    userId: string,
  ): Promise<DashboardRecommendationContext> {
    return this._trackerRepository.getRecommendationContext(userId)
  }
}

export const mongoDashboardRepository = new MongoDashboardRepository()