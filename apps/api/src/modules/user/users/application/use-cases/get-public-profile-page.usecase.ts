import type { IUserActivityRepository } from '../../domain/repositories/user-activity.repository.interface';
import type { IUserProfileRepository } from '../../domain/repositories/user-profile.repository.interface';
import type { IUserRelationshipRepository } from '../../domain/repositories/user-relationship.repository.interface';
import type { IUserTrackerRepository } from '../../domain/repositories/user-tracker.repository.interface';
import type { IUserRepository } from '../../domain/repositories/user.repository.interface';
import type { IPaginationQueryDTO, IPublicProfilePageViewDTO } from '../users.dto';
import { UsersApplicationError } from '../users-application.error';
import type { IUsersMapper } from '../users.mapper';
import type { IUsersProfileDataReader } from '../services/users-profile-data.service';

type PublicProfileRepository = IUserRepository &
  IUserProfileRepository &
  IUserTrackerRepository &
  IUserActivityRepository &
  IUserRelationshipRepository;

export interface IGetPublicProfilePageUseCase {
  execute(
    username: string,
    viewerUserId: string | undefined,
    query: IPaginationQueryDTO
  ): Promise<IPublicProfilePageViewDTO>;
}

export class GetPublicProfilePageUseCase implements IGetPublicProfilePageUseCase {
  constructor(
    private readonly _usersRepository: PublicProfileRepository,
    private readonly _usersMapper: IUsersMapper,
    private readonly _profileDataReader: IUsersProfileDataReader
  ) {}

  async execute(
    username: string,
    viewerUserId: string | undefined,
    query: IPaginationQueryDTO
  ): Promise<IPublicProfilePageViewDTO> {
    const user = await this._usersRepository.findByUsername(username);

    if (!user) {
      throw UsersApplicationError.userNotFound();
    }

    const [profile, settings] = await Promise.all([
      this._usersRepository.ensureForUser({
        userId: user.id,
      }),
      this._usersRepository.findPrivacySettings(user.id),
    ]);

    if (!profile.publicProfileEnabled || settings?.showProfile === false) {
      throw UsersApplicationError.publicProfileNotAvailable();
    }

    const [stats, streak, badges, publishedTrackers, recentActivity, relationship] =
      await Promise.all([
        settings?.showStats === false
          ? Promise.resolve(null)
          : this._profileDataReader.getStats(user.id, user, profile),

        settings?.showStats === false
          ? Promise.resolve(null)
          : this._profileDataReader.getStreakSummary(user.id),

        this._profileDataReader.getBadgeShowcase(user.id),

        settings?.showTrackers === false
          ? Promise.resolve({ items: [], total: 0 })
          : this._usersRepository.findPublishedTrackers({
              ownerId: user.id,
              query,
              includePrivate: false,
            }),

        settings?.showActivity === false
          ? Promise.resolve(null)
          : this._usersRepository
              .findRecentActivity({
                userId: user.id,
                limit: 10,
              })
              .then((items) => items.map((item) => this._usersMapper.toActivityView(item))),

        this._usersRepository.getRelationshipState({
          viewerUserId,
          targetUserId: user.id,
        }),
      ]);

    return {
      user: this._usersMapper.toUserView(user),
      profile: this._usersMapper.toProfileView(profile),
      stats,
      streak,
      badges,
      publishedTrackers: {
        items: publishedTrackers.items.map((item) =>
          this._usersMapper.toPublishedTrackerView(item)
        ),
        pagination: {
          page: query.page,
          limit: query.limit,
          total: publishedTrackers.total,
          totalPages: Math.max(1, Math.ceil(publishedTrackers.total / query.limit)),
        },
      },
      recentActivity,
      relationship,
    };
  }
}
