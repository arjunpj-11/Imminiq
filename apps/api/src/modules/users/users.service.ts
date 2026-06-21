import type {
  PaginationQuery,
  UpdateMyProfileInput,
} from './application/dtos/users.dto'
import {
  createUsersComposition,
  type UsersComposition,
} from './users.factory'

export class UsersService {
  private readonly useCases: UsersComposition['useCases']

  constructor(composition: UsersComposition) {
    this.useCases = composition.useCases
  }

  getMe(userId: string) {
    return this.useCases.getMe.execute(userId)
  }

  updateMe(userId: string, payload: UpdateMyProfileInput) {
    return this.useCases.updateMe.execute(userId, payload)
  }

  getUserByUsername(username: string) {
    return this.useCases.getUserByUsername.execute(username)
  }

  getMyStats(userId: string) {
    return this.useCases.getMyStats.execute(userId)
  }

  getMyActivity(userId: string, page: number, limit: number) {
    return this.useCases.getMyActivity.execute(userId, page, limit)
  }

  getMyRecentActivity(userId: string, limit = 10) {
    return this.useCases.getMyRecentActivity.execute(userId, limit)
  }

  getMyStreak(userId: string, year?: number) {
    return this.useCases.getMyStreak.execute(userId, year)
  }

  getMyPublishedTrackers(userId: string, query: PaginationQuery) {
    return this.useCases.getMyPublishedTrackers.execute(userId, query)
  }

  getMyBadges(userId: string, page: number, limit: number) {
    return this.useCases.getMyBadges.execute(userId, page, limit)
  }

  getPublicProfilePage(
    username: string,
    viewerUserId: string | undefined,
    query: PaginationQuery
  ) {
    return this.useCases.getPublicProfilePage.execute(
      username,
      viewerUserId,
      query
    )
  }
}

export const usersService = new UsersService(
  createUsersComposition()
)