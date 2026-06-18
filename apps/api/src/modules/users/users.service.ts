import type { PaginationQuery, UpdateMyProfileInput } from './application/dtos/users.dto'
import { UsersMapper, type UsersMapperContract } from './application/mappers/users.mapper'
import {
  UsersProfileDataService,
  type UsersProfileDataServiceContract,
} from './application/services/users-profile-data.service'
import { GetMeUseCase } from './application/use-cases/get-me.usecase'
import { GetMyActivityUseCase } from './application/use-cases/get-my-activity.usecase'
import { GetMyBadgesUseCase } from './application/use-cases/get-my-badges.usecase'
import { GetMyPublishedTrackersUseCase } from './application/use-cases/get-my-published-trackers.usecase'
import { GetMyRecentActivityUseCase } from './application/use-cases/get-my-recent-activity.usecase'
import { GetMyStatsUseCase } from './application/use-cases/get-my-stats.usecase'
import { GetMyStreakUseCase } from './application/use-cases/get-my-streak.usecase'
import { GetPublicProfilePageUseCase } from './application/use-cases/get-public-profile-page.usecase'
import { GetUserByUsernameUseCase } from './application/use-cases/get-user-by-username.usecase'
import { UpdateMeUseCase } from './application/use-cases/update-me.usecase'
import type { UsersRepositoryContract } from './domain/repositories/users.repository.interface'
import { mongoUsersRepository } from './infrastructure/repositories/mongo-users.repository'

export class UsersService {
  private readonly getMeUseCase: GetMeUseCase
  private readonly updateMeUseCase: UpdateMeUseCase
  private readonly getUserByUsernameUseCase: GetUserByUsernameUseCase
  private readonly getMyStatsUseCase: GetMyStatsUseCase
  private readonly getMyActivityUseCase: GetMyActivityUseCase
  private readonly getMyRecentActivityUseCase: GetMyRecentActivityUseCase
  private readonly getMyStreakUseCase: GetMyStreakUseCase
  private readonly getMyPublishedTrackersUseCase: GetMyPublishedTrackersUseCase
  private readonly getMyBadgesUseCase: GetMyBadgesUseCase
  private readonly getPublicProfilePageUseCase: GetPublicProfilePageUseCase

  constructor(
    private readonly usersRepository: UsersRepositoryContract,
    private readonly usersMapper: UsersMapperContract,
    private readonly usersProfileDataService: UsersProfileDataServiceContract,
  ) {
    this.getMeUseCase = new GetMeUseCase(
      this.usersRepository,
      this.usersMapper,
    )
    this.updateMeUseCase = new UpdateMeUseCase(
      this.usersRepository,
      this.usersMapper,
    )
    this.getUserByUsernameUseCase = new GetUserByUsernameUseCase(
      this.usersRepository,
      this.usersMapper,
    )
    this.getMyStatsUseCase = new GetMyStatsUseCase(
      this.usersProfileDataService,
    )
    this.getMyActivityUseCase = new GetMyActivityUseCase(
      this.usersRepository,
      this.usersMapper,
    )
    this.getMyRecentActivityUseCase = new GetMyRecentActivityUseCase(
      this.usersRepository,
      this.usersMapper,
    )
    this.getMyStreakUseCase = new GetMyStreakUseCase(
      this.usersProfileDataService,
    )
    this.getMyPublishedTrackersUseCase =
      new GetMyPublishedTrackersUseCase(
        this.usersRepository,
        this.usersMapper,
      )
    this.getMyBadgesUseCase = new GetMyBadgesUseCase(
      this.usersRepository,
      this.usersMapper,
    )
    this.getPublicProfilePageUseCase = new GetPublicProfilePageUseCase(
      this.usersRepository,
      this.usersMapper,
      this.usersProfileDataService,
    )
  }

  getMe(userId: string) {
    return this.getMeUseCase.execute(userId)
  }

  updateMe(userId: string, payload: UpdateMyProfileInput) {
    return this.updateMeUseCase.execute(userId, payload)
  }

  getUserByUsername(username: string) {
    return this.getUserByUsernameUseCase.execute(username)
  }

  getMyStats(userId: string) {
    return this.getMyStatsUseCase.execute(userId)
  }

  getMyActivity(userId: string, page: number, limit: number) {
    return this.getMyActivityUseCase.execute(userId, page, limit)
  }

  getMyRecentActivity(userId: string, limit = 10) {
    return this.getMyRecentActivityUseCase.execute(userId, limit)
  }

  getMyStreak(userId: string, year?: number) {
    return this.getMyStreakUseCase.execute(userId, year)
  }

  getMyPublishedTrackers(userId: string, query: PaginationQuery) {
    return this.getMyPublishedTrackersUseCase.execute(userId, query)
  }

  getMyBadges(userId: string, page: number, limit: number) {
    return this.getMyBadgesUseCase.execute(userId, page, limit)
  }

  getPublicProfilePage(
    username: string,
    viewerUserId: string | undefined,
    query: PaginationQuery,
  ) {
    return this.getPublicProfilePageUseCase.execute(
      username,
      viewerUserId,
      query,
    )
  }
}

const usersRepository = mongoUsersRepository
const usersMapper = new UsersMapper()
const usersProfileDataService = new UsersProfileDataService(
  usersRepository,
  usersMapper,
)

export const usersService = new UsersService(
  usersRepository,
  usersMapper,
  usersProfileDataService,
)
