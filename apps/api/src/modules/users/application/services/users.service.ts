import { mongoUsersRepository } from '../../infrastructure/repositories/mongo-users.repository'
import type {
  PaginationQuery,
  UpdateMyProfileInput,
} from '../../domain/types/users.types'

import { GetMeUseCase } from '../use-cases/get-me.usecase'
import { UpdateMeUseCase } from '../use-cases/update-me.usecase'
import { GetUserByUsernameUseCase } from '../use-cases/get-user-by-username.usecase'
import { GetMyStatsUseCase } from '../use-cases/get-my-stats.usecase'
import { GetMyActivityUseCase } from '../use-cases/get-my-activity.usecase'
import { GetMyRecentActivityUseCase } from '../use-cases/get-my-recent-activity.usecase'
import { GetMyStreakUseCase } from '../use-cases/get-my-streak.usecase'
import { GetMyPublishedTrackersUseCase } from '../use-cases/get-my-published-trackers.usecase'
import { GetMyBadgesUseCase } from '../use-cases/get-my-badges.usecase'
import { GetPublicProfilePageUseCase } from '../use-cases/get-public-profile-page.usecase'

const getMeUseCase =
  new GetMeUseCase(mongoUsersRepository)

const updateMeUseCase =
  new UpdateMeUseCase(mongoUsersRepository)

const getUserByUsernameUseCase =
  new GetUserByUsernameUseCase(mongoUsersRepository)

const getMyStatsUseCase =
  new GetMyStatsUseCase(mongoUsersRepository)

const getMyActivityUseCase =
  new GetMyActivityUseCase(mongoUsersRepository)

const getMyRecentActivityUseCase =
  new GetMyRecentActivityUseCase(mongoUsersRepository)

const getMyStreakUseCase =
  new GetMyStreakUseCase(mongoUsersRepository)

const getMyPublishedTrackersUseCase =
  new GetMyPublishedTrackersUseCase(mongoUsersRepository)

const getMyBadgesUseCase =
  new GetMyBadgesUseCase(mongoUsersRepository)

const getPublicProfilePageUseCase =
  new GetPublicProfilePageUseCase(mongoUsersRepository)

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
