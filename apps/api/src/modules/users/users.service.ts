import { ApiError } from '../../shared/utils/ApiError'
import { usersRepository } from './users.repository'
import type {
  ActivityFeedItemView,
  BadgeShowcaseView,
  CurrentUserView,
  EditableProfileView,
  PaginationQuery,
  ProfileStatsView,
  PublicProfilePageView,
  StreakHeatmapDay,
  StreakSummaryView,
  UpdateMyProfileInput,
} from './users.types'

type IdLike = string | { toString(): string }

type MetadataRecord = Record<string, unknown>
type CriteriaRecord = Record<string, unknown>

interface UserRecord {
  _id: IdLike
  fullName?: string | null
  username?: string | null
  email?: string | null
  role?: CurrentUserView['role'] | null
  status?: CurrentUserView['status'] | null
  emailVerified?: boolean | null
  phoneVerified?: boolean | null
  onboardingCompleted?: boolean | null
  coins?: number | null
  xp?: number | null
  level?: number | null
  streakCount?: number | null
  avatarUrl?: string | null
  provider?: CurrentUserView['provider'] | null
  referralCode?: string | null
  createdAt?: Date
  updatedAt?: Date
}

interface ProfileRecord {
  _id?: IdLike | null
  fullName?: string | null
  headline?: string | null
  bio?: string | null
  location?: string | null
  education?: string | null
  skills?: string[] | null
  interests?: string[] | null
  githubUrl?: string | null
  linkedinUrl?: string | null
  portfolioUrl?: string | null
  profileBannerUrl?: string | null
  publicProfileEnabled?: boolean | null
  publishedCount?: number | null
  cloneCount?: number | null
  ratingAverage?: number | null
  likeCount?: number | null
}

interface ActivityRecord {
  _id: IdLike
  action?: string | null
  module?: string | null
  metadata?: MetadataRecord | null
  createdAt: Date
}

interface BadgeCatalogRecord {
  _id: IdLike
  name?: string | null
  description?: string | null
  iconUrl?: string | null
  badgeType: BadgeShowcaseView['items'][number]['badgeType']
  criteria?: CriteriaRecord | null
}

interface EarnedBadgeShowcaseRecord {
  badgeId: IdLike
  earnedAt?: Date | string | null
}

interface EarnedBadgeRecord {
  badgeId?: {
    _id: IdLike
    name?: string | null
    description?: string | null
    iconUrl?: string | null
    badgeType: BadgeShowcaseView['items'][number]['badgeType']
    criteria?: CriteriaRecord | null
  } | null
  earnedAt?: Date | string | null
}

interface StreakHistoryRecord {
  date?: Date | string | null
  activityCount?: number | null
  intensityLevel?: StreakHeatmapDay['intensityLevel'] | null
  streakDay?: number | null
  isFrozen?: boolean | null
}

interface StreakSnapshotRecord {
  currentStreak?: number | null
  longestStreak?: number | null
  totalActiveDays?: number | null
  totalFreezeUsed?: number | null
}

const toIdString = (value: IdLike) => String(value)

const isRecord = (value: unknown): value is Record<string, unknown> => {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

const formatDate = (value: Date | string | undefined | null) => {
  if (!value) return null

  const date = new Date(value)

  if (Number.isNaN(date.getTime())) return null

  return date.toISOString().slice(0, 10)
}

const toDateOrNull = (
  value: Date | string | null | undefined
): Date | null => {
  if (!value) return null

  const date = value instanceof Date ? value : new Date(value)

  return Number.isNaN(date.getTime()) ? null : date
}

const cleanTags = (tags?: string[]) => {
  if (!tags) return undefined

  const unique = new Set<string>()

  for (const tag of tags) {
    const value = tag.trim()

    if (value) {
      unique.add(value)
    }
  }

  return [...unique]
}

const mapUser = (user: UserRecord): CurrentUserView => ({
  _id: toIdString(user._id),
  fullName: user.fullName ?? '',
  username: user.username ?? '',
  email: user.email ?? undefined,
  role: user.role ?? 'user',
  status: user.status ?? 'active',
  emailVerified: Boolean(user.emailVerified),
  phoneVerified: Boolean(user.phoneVerified),
  onboardingCompleted: Boolean(user.onboardingCompleted),
  coins: Number(user.coins ?? 0),
  xp: Number(user.xp ?? 0),
  level: Number(user.level ?? 0),
  streakCount: Number(user.streakCount ?? 0),
  avatarUrl: user.avatarUrl ?? '',
  provider: user.provider ?? 'email',
  referralCode: user.referralCode ?? '',
  createdAt: user.createdAt,
  updatedAt: user.updatedAt,
})

const mapProfile = (
  profile: ProfileRecord | null | undefined,
  userId: string
): EditableProfileView => ({
  _id: profile?._id ? toIdString(profile._id) : undefined,
  userId,
  fullName: profile?.fullName ?? '',
  headline: profile?.headline ?? '',
  bio: profile?.bio ?? '',
  location: profile?.location ?? '',
  education: profile?.education ?? '',
  skills: Array.isArray(profile?.skills) ? profile.skills : [],
  interests: Array.isArray(profile?.interests) ? profile.interests : [],
  githubUrl: profile?.githubUrl ?? '',
  linkedinUrl: profile?.linkedinUrl ?? '',
  portfolioUrl: profile?.portfolioUrl ?? '',
  profileBannerUrl: profile?.profileBannerUrl ?? '',
  publicProfileEnabled: Boolean(profile?.publicProfileEnabled ?? true),
  publishedCount: Number(profile?.publishedCount ?? 0),
  cloneCount: Number(profile?.cloneCount ?? 0),
  ratingAverage: Number(profile?.ratingAverage ?? 0),
  likeCount: Number(profile?.likeCount ?? 0),
})

const activityDescription = (item: ActivityRecord) => {
  const description = item.metadata?.description

  const fromMetadata =
    typeof description === 'string'
      ? description
      : ''

  if (fromMetadata) return fromMetadata

  return item.action
    ? item.action
        .split('_')
        .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
        .join(' ')
    : 'Activity logged'
}

const mapActivity = (item: ActivityRecord): ActivityFeedItemView => ({
  _id: toIdString(item._id),
  action: item.action ?? '',
  module: item.module ?? '',
  description: activityDescription(item),
  metadata: isRecord(item.metadata) ? item.metadata : {},
  createdAt: item.createdAt,
})

const getBadgeShowcase = async (
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

const getStreakSummary = async (
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

const getStats = async (
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

export const usersService = {
  async getMe(userId: string) {
    const user =
      (await usersRepository.findUserById(userId)) as UserRecord | null

    if (!user) {
      throw new ApiError(404, 'User not found')
    }

    const profile =
      (await usersRepository.ensureProfileForUser(
        toIdString(user._id),
        user.fullName ?? ''
      )) as ProfileRecord

    return {
      user: mapUser(user),
      profile: mapProfile(profile, toIdString(user._id)),
    }
  },

  async updateMe(userId: string, payload: UpdateMyProfileInput) {
    const user =
      (await usersRepository.findUserById(userId)) as UserRecord | null

    if (!user) {
      throw new ApiError(404, 'User not found')
    }

    const normalizedPayload: UpdateMyProfileInput = {
      ...payload,
      fullName: payload.fullName?.trim(),
      skills: cleanTags(payload.skills),
      interests: cleanTags(payload.interests),
    }

    const updatedProfile =
      (await usersRepository.updateProfileByUserId(
        toIdString(user._id),
        normalizedPayload
      )) as ProfileRecord | null

    if (!updatedProfile) {
      throw new ApiError(500, 'Profile update failed')
    }

    let resolvedUser: UserRecord = user

    if (
      normalizedPayload.fullName &&
      normalizedPayload.fullName !== user.fullName
    ) {
      const updatedUser =
        (await usersRepository.updateUserFullName(
          toIdString(user._id),
          normalizedPayload.fullName
        )) as UserRecord | null

      if (!updatedUser) {
        throw new ApiError(500, 'User full name update failed')
      }

      resolvedUser = updatedUser
    }

    return {
      user: mapUser(resolvedUser),
      profile: mapProfile(updatedProfile, toIdString(user._id)),
    }
  },

  async getUserByUsername(username: string) {
    const user =
      (await usersRepository.findUserByUsername(
        username
      )) as UserRecord | null

    if (!user) {
      throw new ApiError(404, 'User not found')
    }

    return mapUser(user)
  },

  async getMyStats(userId: string) {
    return getStats(userId)
  },

  async getMyActivity(userId: string, page: number, limit: number) {
    const { items, total } = await usersRepository.findActivityFeed(
      userId,
      page,
      limit
    )

    return {
      items: (items as ActivityRecord[]).map(mapActivity),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.max(1, Math.ceil(total / limit)),
      },
    }
  },

  async getMyRecentActivity(userId: string, limit = 10) {
    const items = await usersRepository.findRecentActivity(userId, limit)

    return {
      items: (items as ActivityRecord[]).map(mapActivity),
    }
  },

  async getMyStreak(userId: string, year?: number) {
    return getStreakSummary(userId, year)
  },

  async getMyPublishedTrackers(
    userId: string,
    query: PaginationQuery
  ) {
    const { items, total } =
      await usersRepository.findPublishedTrackers(userId, query, false)

    return {
      items,
      pagination: {
        page: query.page,
        limit: query.limit,
        total,
        totalPages: Math.max(1, Math.ceil(total / query.limit)),
      },
    }
  },

  async getMyBadges(userId: string, page: number, limit: number) {
    const { items, total } =
      await usersRepository.findEarnedBadgesPaginated(userId, page, limit)

    const typedItems = items as EarnedBadgeRecord[]

    return {
      items: typedItems
        .filter(
          (
            item
          ): item is EarnedBadgeRecord & {
            badgeId: NonNullable<EarnedBadgeRecord['badgeId']>
          } => Boolean(item.badgeId)
        )
        .map((item) => ({
          _id: toIdString(item.badgeId._id),
          name: item.badgeId.name ?? '',
          description: item.badgeId.description ?? '',
          iconUrl: item.badgeId.iconUrl ?? '',
          badgeType: item.badgeId.badgeType,
          criteria: isRecord(item.badgeId.criteria)
            ? item.badgeId.criteria
            : {},
          earnedAt: item.earnedAt,
        })),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.max(1, Math.ceil(total / limit)),
      },
    }
  },

  async getPublicProfilePage(
    username: string,
    viewerUserId: string | undefined,
    query: PaginationQuery
  ): Promise<PublicProfilePageView> {
    const user =
      (await usersRepository.findUserByUsername(
        username
      )) as UserRecord | null

    if (!user) {
      throw new ApiError(404, 'User not found')
    }

    const userId = toIdString(user._id)

    const [profile, settings] = await Promise.all([
      usersRepository.ensureProfileForUser(userId, user.fullName ?? ''),
      usersRepository.findSettingsByUserId(userId),
    ])

    const typedProfile = profile as ProfileRecord

    if (
      !typedProfile.publicProfileEnabled ||
      settings?.privacyShowProfile === false
    ) {
      throw new ApiError(404, 'Public profile not available')
    }

    const [
      stats,
      streak,
      badges,
      publishedTrackers,
      recentActivity,
      relationship,
    ] = await Promise.all([
      settings?.privacyShowStats === false
        ? Promise.resolve(null)
        : getStats(userId, user, typedProfile),

      settings?.privacyShowStats === false
        ? Promise.resolve(null)
        : getStreakSummary(userId),

      getBadgeShowcase(userId),

      settings?.privacyShowTrackers === false
        ? Promise.resolve({
            items: [],
            total: 0,
          })
        : usersRepository.findPublishedTrackers(userId, query, false),

      settings?.privacyShowActivity === false
        ? Promise.resolve(null)
        : usersRepository
            .findRecentActivity(userId, 10)
            .then((items) => (items as ActivityRecord[]).map(mapActivity)),

      usersRepository.getRelationshipState(viewerUserId, userId),
    ])

    return {
      user: mapUser(user),
      profile: mapProfile(typedProfile, userId),
      stats,
      streak,
      badges,
      publishedTrackers: {
        items: publishedTrackers.items,
        pagination: {
          page: query.page,
          limit: query.limit,
          total: publishedTrackers.total,
          totalPages: Math.max(
            1,
            Math.ceil(publishedTrackers.total / query.limit)
          ),
        },
      },
      recentActivity,
      relationship,
    }
  },
}