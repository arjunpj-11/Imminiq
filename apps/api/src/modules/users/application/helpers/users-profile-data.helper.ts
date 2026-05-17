import { ApiError } from '../../../../shared/utils/ApiError'
import type { UsersRepository } from '../../domain/repositories/users.repository.interface'
import type {
  BadgeCatalogRecord,
  BadgeShowcaseView,
  EarnedBadgeShowcaseRecord,
  ProfileRecord,
  ProfileStatsView,
  StreakHeatmapDay,
  StreakHistoryRecord,
  StreakSnapshotRecord,
  StreakSummaryView,
  UserRecord,
} from '../../domain/types/users.types'
import {
  formatDate,
  isRecord,
  toDateOrNull,
  toIdString,
} from '../utils/users-view-mappers'

export const getBadgeShowcase = async (
  usersRepository: UsersRepository,
  userId: string
): Promise<BadgeShowcaseView> => {
  const { catalog, earned } =
    await usersRepository.findBadgeShowcase(userId)

  const earnedMap = new Map<string, EarnedBadgeShowcaseRecord>(
    (earned as EarnedBadgeShowcaseRecord[]).map((item) => [
      toIdString(item.badgeId),
      item,
    ])
  )

  const items: BadgeShowcaseView['items'] = (
    catalog as BadgeCatalogRecord[]
  ).map((badge) => {
    const userBadge = earnedMap.get(toIdString(badge._id))

    return {
      _id: toIdString(badge._id),
      name: badge.name ?? '',
      description: badge.description ?? '',
      iconUrl: badge.iconUrl ?? '',
      badgeType: badge.badgeType,
      earned: Boolean(userBadge),
      earnedAt: toDateOrNull(userBadge?.earnedAt),
      criteria: isRecord(badge.criteria) ? badge.criteria : {},
    }
  })

  return {
    earnedCount: items.filter((item) => item.earned).length,
    totalCount: items.length,
    items,
  }
}

export const getStreakSummary = async (
  usersRepository: UsersRepository,
  userId: string,
  requestedYear?: number
): Promise<StreakSummaryView> => {
  const year = requestedYear ?? new Date().getUTCFullYear()

  const [snapshot, history] = await Promise.all([
    usersRepository.findLatestStreakSnapshot(userId),
    usersRepository.findStreakHistoryByYear(userId, year),
  ])

  const typedSnapshot = snapshot as StreakSnapshotRecord | null
  const typedHistory = history as StreakHistoryRecord[]

  const heatmap: StreakHeatmapDay[] = typedHistory.map((day) => ({
    date: formatDate(day.date) ?? '',
    activityCount: Number(day.activityCount ?? 0),
    intensityLevel: day.intensityLevel ?? 'none',
    streakDay: Number(day.streakDay ?? 0),
    isFrozen: Boolean(day.isFrozen),
  }))

  const lastActiveDate =
    typedHistory.length > 0
      ? formatDate(typedHistory[typedHistory.length - 1]?.date)
      : null

  return {
    currentStreak: Number(typedSnapshot?.currentStreak ?? 0),
    longestStreak: Number(typedSnapshot?.longestStreak ?? 0),
    totalActiveDays: Number(typedSnapshot?.totalActiveDays ?? 0),
    totalFreezeUsed: Number(typedSnapshot?.totalFreezeUsed ?? 0),
    lastActiveDate,
    heatmap,
  }
}

export const getStats = async (
  usersRepository: UsersRepository,
  userId: string,
  user?: UserRecord,
  profile?: ProfileRecord
): Promise<ProfileStatsView> => {
  const resolvedUser =
    user ??
    ((await usersRepository.findUserById(userId)) as UserRecord | null)

  if (!resolvedUser) {
    throw new ApiError(404, 'User not found')
  }

  const resolvedProfile =
    profile ??
    ((await usersRepository.findProfileByUserId(
      toIdString(resolvedUser._id)
    )) as ProfileRecord | null)

  return {
    streakCount: Number(resolvedUser.streakCount ?? 0),
    studentLevel: Number(resolvedUser.level ?? 0),
    xp: Number(resolvedUser.xp ?? 0),
    coins: Number(resolvedUser.coins ?? 0),
    publishedCount: Number(resolvedProfile?.publishedCount ?? 0),
    cloneCount: Number(resolvedProfile?.cloneCount ?? 0),
    ratingAverage: Number(resolvedProfile?.ratingAverage ?? 0),
    likeCount: Number(resolvedProfile?.likeCount ?? 0),
  }
}
