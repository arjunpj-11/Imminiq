import type { UserProfileEntity } from '../../domain/entities/user-profile.entity'
import type { UserEntity } from '../../domain/entities/user.entity'
import type { UserBadgeRepositoryContract } from '../../domain/repositories/user-badge.repository.interface'
import type { UserProfileRepositoryContract } from '../../domain/repositories/user-profile.repository.interface'
import type { UserStreakRepositoryContract } from '../../domain/repositories/user-streak.repository.interface'
import type { UserRepositoryContract } from '../../domain/repositories/user.repository.interface'
import type {
  BadgeShowcaseView,
  ProfileStatsView,
  StreakSummaryView,
} from '../dtos/users.dto'
import { UsersApplicationError } from '../errors/users-application.error'
import type { UsersMapperContract } from '../mappers/users.mapper'

type UsersProfileDataRepository =
  UserRepositoryContract &
  UserProfileRepositoryContract &
  UserBadgeRepositoryContract &
  UserStreakRepositoryContract

export interface UsersProfileDataServiceContract {
  getBadgeShowcase(userId: string): Promise<BadgeShowcaseView>
  getStreakSummary(
    userId: string,
    requestedYear?: number,
  ): Promise<StreakSummaryView>
  getStats(
    userId: string,
    user?: UserEntity,
    profile?: UserProfileEntity,
  ): Promise<ProfileStatsView>
}

export class UsersProfileDataService
  implements UsersProfileDataServiceContract
{
  constructor(
    private readonly usersRepository: UsersProfileDataRepository,
    private readonly usersMapper: UsersMapperContract,
  ) {}

  async getBadgeShowcase(userId: string): Promise<BadgeShowcaseView> {
    const { catalog, earned } =
      await this.usersRepository.findBadgeShowcase(userId)

    const earnedMap = new Map(
      earned.map((item) => [item.badge.id, item.earnedAt] as const),
    )

    const items = catalog.map((badge) =>
      this.usersMapper.toBadgeShowcaseItem(
        badge,
        earnedMap.get(badge.id),
      ),
    )

    return {
      earnedCount: items.filter((item) => item.earned).length,
      totalCount: items.length,
      items,
    }
  }

  async getStreakSummary(
    userId: string,
    requestedYear?: number,
  ): Promise<StreakSummaryView> {
    const year = requestedYear ?? new Date().getUTCFullYear()

   const [snapshot, history] = await Promise.all([
  this.usersRepository.findLatestSnapshot(userId),
  this.usersRepository.findHistoryByYear({
    userId,
    year,
  }),
])

    const heatmap = history.map((day) =>
      this.usersMapper.toStreakHeatmapDay(day),
    )

    return {
      currentStreak: snapshot?.currentStreak ?? 0,
      longestStreak: snapshot?.longestStreak ?? 0,
      totalActiveDays: snapshot?.totalActiveDays ?? 0,
      totalFreezeUsed: snapshot?.totalFreezeUsed ?? 0,
      lastActiveDate: heatmap.at(-1)?.date || null,
      heatmap,
    }
  }

  async getStats(
    userId: string,
    user?: UserEntity,
    profile?: UserProfileEntity,
  ): Promise<ProfileStatsView> {
    const resolvedUser =
      user ?? (await this.usersRepository.findById(userId))

    if (!resolvedUser) {
      throw UsersApplicationError.userNotFound()
    }

    const resolvedProfile =
      profile ??
      (await this.usersRepository.findByUserId(resolvedUser.id))

    return {
      streakCount: resolvedUser.streakCount,
      studentLevel: resolvedUser.level,
      xp: resolvedUser.xp,
      coins: resolvedUser.coins,
      publishedCount: resolvedProfile?.publishedCount ?? 0,
      cloneCount: resolvedProfile?.cloneCount ?? 0,
      ratingAverage: resolvedProfile?.ratingAverage ?? 0,
      likeCount: resolvedProfile?.likeCount ?? 0,
    }
  }
}