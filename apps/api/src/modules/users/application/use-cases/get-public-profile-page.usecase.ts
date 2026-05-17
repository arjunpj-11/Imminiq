import { ApiError } from '../../../../shared/utils/ApiError'
import type { UsersRepository } from '../../domain/repositories/users.repository.interface'
import type {
  ActivityRecord,
  PaginationQuery,
  ProfileRecord,
  PublicProfilePageView,
  UserRecord,
} from '../../domain/types/users.types'
import {
  getBadgeShowcase,
  getStats,
  getStreakSummary,
} from '../helpers/users-profile-data.helper'
import {
  mapActivity,
  mapProfile,
  mapUser,
  toIdString,
} from '../utils/users-view-mappers'

export class GetPublicProfilePageUseCase {
  constructor(
    private readonly usersRepository: UsersRepository
  ) {}

  async execute(
    username: string,
    viewerUserId: string | undefined,
    query: PaginationQuery
  ): Promise<PublicProfilePageView> {
    const user =
      (await this.usersRepository.findUserByUsername(
        username
      )) as UserRecord | null

    if (!user) {
      throw new ApiError(404, 'User not found')
    }

    const userId = toIdString(user._id)

    const [profile, settings] = await Promise.all([
      this.usersRepository.ensureProfileForUser(userId, user.fullName ?? ''),
      this.usersRepository.findSettingsByUserId(userId),
    ])

    const typedProfile = profile as ProfileRecord
    const typedSettings = settings as {
      privacyShowProfile?: boolean
      privacyShowStats?: boolean
      privacyShowTrackers?: boolean
      privacyShowActivity?: boolean
    } | null

    if (
      !typedProfile.publicProfileEnabled ||
      typedSettings?.privacyShowProfile === false
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
      typedSettings?.privacyShowStats === false
        ? Promise.resolve(null)
        : getStats(this.usersRepository, userId, user, typedProfile),

      typedSettings?.privacyShowStats === false
        ? Promise.resolve(null)
        : getStreakSummary(this.usersRepository, userId),

      getBadgeShowcase(this.usersRepository, userId),

      typedSettings?.privacyShowTrackers === false
        ? Promise.resolve({
            items: [],
            total: 0,
          })
        : this.usersRepository.findPublishedTrackers(userId, query, false),

      typedSettings?.privacyShowActivity === false
        ? Promise.resolve(null)
        : this.usersRepository
            .findRecentActivity(userId, 10)
            .then((items) => (items as ActivityRecord[]).map(mapActivity)),

      this.usersRepository.getRelationshipState(viewerUserId, userId),
    ])

    return {
      user: mapUser(user),
      profile: mapProfile(typedProfile, userId),
      stats,
      streak,
      badges,
      publishedTrackers: {
        items: publishedTrackers.items as PublicProfilePageView['publishedTrackers']['items'],
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
  }
}
