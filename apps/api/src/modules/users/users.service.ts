import { mongoUsersRepository } from './infrastructure/repositories/mongo-users.repository'
import type {
  PaginationQuery,
  UpdateMyProfileInput,
} from './domain/types/users.types'

import { GetMeUseCase } from './application/use-cases/get-me.usecase'
import { UpdateMeUseCase } from './application/use-cases/update-me.usecase'
import { GetUserByUsernameUseCase } from './application/use-cases/get-user-by-username.usecase'
import { GetMyStatsUseCase } from './application/use-cases/get-my-stats.usecase'
import { GetMyActivityUseCase } from './application/use-cases/get-my-activity.usecase'
import { GetMyRecentActivityUseCase } from './application/use-cases/get-my-recent-activity.usecase'
import { GetMyStreakUseCase } from './application/use-cases/get-my-streak.usecase'
import { GetMyPublishedTrackersUseCase } from './application/use-cases/get-my-published-trackers.usecase'
import { GetMyBadgesUseCase } from './application/use-cases/get-my-badges.usecase'
import { GetPublicProfilePageUseCase } from './application/use-cases/get-public-profile-page.usecase'

const usersRepository = mongoUsersRepository

const getMeUseCase =
  new GetMeUseCase(usersRepository)

const updateMeUseCase =
  new UpdateMeUseCase(usersRepository)

const getUserByUsernameUseCase =
  new GetUserByUsernameUseCase(usersRepository)

const getMyStatsUseCase =
  new GetMyStatsUseCase(usersRepository)

const getMyActivityUseCase =
  new GetMyActivityUseCase(usersRepository)

const getMyRecentActivityUseCase =
  new GetMyRecentActivityUseCase(usersRepository)

const getMyStreakUseCase =
  new GetMyStreakUseCase(usersRepository)

const getMyPublishedTrackersUseCase =
  new GetMyPublishedTrackersUseCase(usersRepository)

const getMyBadgesUseCase =
  new GetMyBadgesUseCase(usersRepository)

const getPublicProfilePageUseCase =
  new GetPublicProfilePageUseCase(usersRepository)

export const usersService = {
  async getMe(userId: string) {
    return getMeUseCase.execute(userId)
  },

  async updateMe(userId: string, payload: UpdateMyProfileInput) {
    return updateMeUseCase.execute(userId, payload)
  },

  async getUserByUsername(username: string) {
    return getUserByUsernameUseCase.execute(username)
  },

  async getMyStats(userId: string) {
    return getMyStatsUseCase.execute(userId)
  },

  async getMyActivity(userId: string, page: number, limit: number) {
    return getMyActivityUseCase.execute(userId, page, limit)
  },

  async getMyRecentActivity(userId: string, limit = 10) {
    return getMyRecentActivityUseCase.execute(userId, limit)
  },

  async getMyStreak(userId: string, year?: number) {
    return getMyStreakUseCase.execute(userId, year)
  },

  async getMyPublishedTrackers(
    userId: string,
    query: PaginationQuery
  ) {
    return getMyPublishedTrackersUseCase.execute(userId, query)
  },

  async getMyBadges(userId: string, page: number, limit: number) {
    return getMyBadgesUseCase.execute(userId, page, limit)
  },

  async getPublicProfilePage(
    username: string,
    viewerUserId: string | undefined,
    query: PaginationQuery
  ) {
    return getPublicProfilePageUseCase.execute(
      username,
      viewerUserId,
      query
    )
  },
}
