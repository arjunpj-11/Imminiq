import type { UserActivityRepositoryContract } from '../../domain/repositories/user-activity.repository.interface'
import type { UserProfileRepositoryContract } from '../../domain/repositories/user-profile.repository.interface'
import type { UserRelationshipRepositoryContract } from '../../domain/repositories/user-relationship.repository.interface'
import type { UserTrackerRepositoryContract } from '../../domain/repositories/user-tracker.repository.interface'
import type { UserRepositoryContract } from '../../domain/repositories/user.repository.interface'
import type {
  PaginationQuery,
  PublicProfilePageView,
} from '../dtos/users.dto'
import { UsersApplicationError } from '../errors/users-application.error'
import type { UsersMapperContract } from '../mappers/users.mapper'
import type { UsersProfileDataServiceContract } from '../services/users-profile-data.service'

type PublicProfileRepository =
  UserRepositoryContract &
  UserProfileRepositoryContract &
  UserTrackerRepositoryContract &
  UserActivityRepositoryContract &
  UserRelationshipRepositoryContract

export class GetPublicProfilePageUseCase {
  constructor(
    private readonly usersRepository: PublicProfileRepository,
    private readonly usersMapper: UsersMapperContract,
    private readonly usersProfileDataService: UsersProfileDataServiceContract,
  ) {}

  async execute(
    username: string,
    viewerUserId: string | undefined,
    query: PaginationQuery,
  ): Promise<PublicProfilePageView> {
    const user = await this.usersRepository.findByUsername(username)

    if (!user) {
      throw UsersApplicationError.userNotFound()
    }

    const [profile, settings] = await Promise.all([
      this.usersRepository.ensureForUser({
        userId: user.id,
      }),
      this.usersRepository.findPrivacySettings(user.id),
    ])

    if (!profile.publicProfileEnabled || settings?.showProfile === false) {
      throw UsersApplicationError.publicProfileNotAvailable()
    }

    const [
      stats,
      streak,
      badges,
      publishedTrackers,
      recentActivity,
      relationship,
    ] = await Promise.all([
      settings?.showStats === false
        ? Promise.resolve(null)
        : this.usersProfileDataService.getStats(user.id, user, profile),

      settings?.showStats === false
        ? Promise.resolve(null)
        : this.usersProfileDataService.getStreakSummary(user.id),

      this.usersProfileDataService.getBadgeShowcase(user.id),

      settings?.showTrackers === false
        ? Promise.resolve({ items: [], total: 0 })
        : this.usersRepository.findPublishedTrackers({
            ownerId: user.id,
            query,
            includePrivate: false,
          }),

      settings?.showActivity === false
        ? Promise.resolve(null)
        : this.usersRepository
            .findRecentActivity({
              userId: user.id,
              limit: 10,
            })
            .then((items) =>
              items.map((item) => this.usersMapper.toActivityView(item)),
            ),

      this.usersRepository.getRelationshipState({
        viewerUserId,
        targetUserId: user.id,
      }),
    ])

    return {
      user: this.usersMapper.toUserView(user),
      profile: this.usersMapper.toProfileView(profile),
      stats,
      streak,
      badges,
      publishedTrackers: {
        items: publishedTrackers.items.map((item) =>
          this.usersMapper.toPublishedTrackerView(item),
        ),
        pagination: {
          page: query.page,
          limit: query.limit,
          total: publishedTrackers.total,
          totalPages: Math.max(
            1,
            Math.ceil(publishedTrackers.total / query.limit),
          ),
        },
      },
      recentActivity,
      relationship,
    }
  }
}