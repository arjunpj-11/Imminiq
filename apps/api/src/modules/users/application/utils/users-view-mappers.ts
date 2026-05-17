import type {
  ActivityFeedItemView,
  ActivityRecord,
  CurrentUserView,
  EditableProfileView,
  IdLike,
  ProfileRecord,
  UserRecord,
} from '../../domain/types/users.types'

export const toIdString = (value: IdLike) => String(value)

export const isRecord = (
  value: unknown
): value is Record<string, unknown> => {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

export const formatDate = (
  value: Date | string | undefined | null
) => {
  if (!value) return null

  const date = new Date(value)

  if (Number.isNaN(date.getTime())) return null

  return date.toISOString().slice(0, 10)
}

export const toDateOrNull = (
  value: Date | string | null | undefined
): Date | null => {
  if (!value) return null

  const date = value instanceof Date ? value : new Date(value)

  return Number.isNaN(date.getTime()) ? null : date
}

export const cleanTags = (tags?: string[]) => {
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

export const mapUser = (user: UserRecord): CurrentUserView => ({
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

export const mapProfile = (
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

export const mapActivity = (
  item: ActivityRecord
): ActivityFeedItemView => ({
  _id: toIdString(item._id),
  action: item.action ?? '',
  module: item.module ?? '',
  description: activityDescription(item),
  metadata: isRecord(item.metadata) ? item.metadata : {},
  createdAt: item.createdAt,
})
