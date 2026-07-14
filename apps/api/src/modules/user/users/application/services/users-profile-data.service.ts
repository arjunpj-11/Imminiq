import type { UserProfileEntity } from '../../domain/entities/user-profile.entity';
import type { UserEntity } from '../../domain/entities/user.entity';
import type { IUserBadgeRepository } from '../../domain/repositories/user-badge.repository.interface';
import type { IUserProfileRepository } from '../../domain/repositories/user-profile.repository.interface';
import type { IUserStreakRepository } from '../../domain/repositories/user-streak.repository.interface';
import type { IUserTrackerRepository } from '../../domain/repositories/user-tracker.repository.interface';
import type { IUserRepository } from '../../domain/repositories/user.repository.interface';
import type { BadgeShowcaseViewDTO, ProfileStatsViewDTO, StreakSummaryViewDTO } from '../users.dto';
import { UsersApplicationError } from '../users-application.error';
import type { IUsersMapper } from '../users.mapper';
import type { IClock } from '../../../../../shared/time/clock.interface';

type UsersProfileDataRepository = IUserRepository &
  IUserProfileRepository &
  IUserBadgeRepository &
  IUserStreakRepository &
  IUserTrackerRepository;

export interface IUsersProfileDataReader {
  getBadgeShowcase(userId: string): Promise<BadgeShowcaseViewDTO>;
  getStreakSummary(userId: string, requestedYear?: number): Promise<StreakSummaryViewDTO>;
  getStats(
    userId: string,
    user?: UserEntity,
    profile?: UserProfileEntity
  ): Promise<ProfileStatsViewDTO>;
}

export class UsersProfileDataReader implements IUsersProfileDataReader {
  constructor(
    private readonly _usersRepository: UsersProfileDataRepository,
    private readonly _usersMapper: IUsersMapper,
    private readonly _clock: IClock
  ) {}

  async getBadgeShowcase(userId: string): Promise<BadgeShowcaseViewDTO> {
    const { catalog, earned } = await this._usersRepository.findBadgeShowcase(userId);

    const earnedMap = new Map(earned.map((item) => [item.badge.id, item.earnedAt] as const));

    const items = catalog.map((badge) =>
      this._usersMapper.toBadgeShowcaseItem(badge, earnedMap.get(badge.id))
    );

    return {
      earnedCount: items.filter((item) => item.earned).length,
      totalCount: items.length,
      items,
    };
  }

  async getStreakSummary(userId: string, requestedYear?: number): Promise<StreakSummaryViewDTO> {
    const year = requestedYear ?? this._clock.now().getUTCFullYear();

    const [snapshot, history] = await Promise.all([
      this._usersRepository.findLatestSnapshot(userId),
      this._usersRepository.findHistoryByYear({
        userId,
        year,
      }),
    ]);

    const heatmap = history.map((day) => this._usersMapper.toStreakHeatmapDay(day));

    return {
      currentStreak: snapshot?.currentStreak ?? 0,
      longestStreak: snapshot?.longestStreak ?? 0,
      totalActiveDays: snapshot?.totalActiveDays ?? 0,
      totalFreezeUsed: snapshot?.totalFreezeUsed ?? 0,
      lastActiveDate: heatmap.at(-1)?.date || null,
      heatmap,
    };
  }

  async getStats(
    userId: string,
    user?: UserEntity,
    _profile?: UserProfileEntity
  ): Promise<ProfileStatsViewDTO> {
    const resolvedUser = user ?? (await this._usersRepository.findById(userId));

    if (!resolvedUser) {
      throw UsersApplicationError.userNotFound();
    }

    const [ranks, trackerMetrics] = await Promise.all([
      this._usersRepository.getProgressionRanks(resolvedUser.id),
      this._usersRepository.getPublishedTrackerMetrics(resolvedUser.id),
    ]);

    return {
      streakCount: resolvedUser.streakCount,
      studentLevel: resolvedUser.level,
      studentRank: ranks.studentRank,
      xp: resolvedUser.xp,
      teacherLevel: resolvedUser.teacherLevel,
      teacherXp: resolvedUser.teacherXp,
      teacherRank: ranks.teacherRank,
      coins: resolvedUser.coins,
      publishedCount: trackerMetrics.publishedCount,
      cloneCount: trackerMetrics.cloneCount,
      ratingAverage: trackerMetrics.ratingAverage,
      likeCount: trackerMetrics.likeCount,
    };
  }
}
