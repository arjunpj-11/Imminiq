import type { UserProfileEntity } from '../../domain/entities/user-profile.entity'
import type { UserEntity } from '../../domain/entities/user.entity'
import type { IUserBadgeRepository } from '../../domain/repositories/user-badge.repository.interface'
import type { IUserProfileRepository } from '../../domain/repositories/user-profile.repository.interface'
import type { IUserStreakRepository } from '../../domain/repositories/user-streak.repository.interface'
import type { IUserRepository } from '../../domain/repositories/user.repository.interface'
import type {
  IBadgeShowcaseViewDTO,
  IProfileStatsViewDTO,
  IStreakSummaryViewDTO,
} from '../users.dto'
import { UsersApplicationError } from '../users-application.error'
import type { IUsersMapper } from '../users.mapper'
import type { IClock } from '../../../../../shared/time/clock.interface'

type UsersProfileDataRepository =
  IUserRepository &
  IUserProfileRepository &
  IUserBadgeRepository &
  IUserStreakRepository

export interface IUsersProfileDataReader {
  getBadgeShowcase(userId: string): Promise<IBadgeShowcaseViewDTO>
  getStreakSummary(
    userId: string,
    requestedYear?: number,
  ): Promise<IStreakSummaryViewDTO>
  getStats(
    userId: string,
    user?: UserEntity,
    profile?: UserProfileEntity,
  ): Promise<IProfileStatsViewDTO>
}

export class UsersProfileDataReader
  implements IUsersProfileDataReader
{
  constructor(
    private readonly _usersRepository: UsersProfileDataRepository,
    private readonly _usersMapper: IUsersMapper,
    private readonly _clock: IClock,
  ) {}

  async getBadgeShowcase(userId: string): Promise<IBadgeShowcaseViewDTO> {
    const { catalog, earned } =
      await this._usersRepository.findBadgeShowcase(userId)

    const earnedMap = new Map(
      earned.map((item) => [item.badge.id, item.earnedAt] as const),
    )

    const items = catalog.map((badge) =>
      this._usersMapper.toBadgeShowcaseItem(
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
  ): Promise<IStreakSummaryViewDTO> {
    const year = requestedYear ?? this._clock.now().getUTCFullYear()

   const [snapshot, history] = await Promise.all([
  this._usersRepository.findLatestSnapshot(userId),
  this._usersRepository.findHistoryByYear({
    userId,
    year,
  }),
])

    const heatmap = history.map((day) =>
      this._usersMapper.toStreakHeatmapDay(day),
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
  ): Promise<IProfileStatsViewDTO> {
    const resolvedUser =
      user ?? (await this._usersRepository.findById(userId))

    if (!resolvedUser) {
      throw UsersApplicationError.userNotFound()
    }

    const resolvedProfile =
      profile ??
      (await this._usersRepository.findByUserId(resolvedUser.id))

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
