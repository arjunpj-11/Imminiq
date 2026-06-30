import type {
  PaginationQuery,
  UpdateMyProfileInput,
} from './application/dtos/users.dto'
import {
  createUsersComposition,
  type UsersComposition,
} from './users.factory'

export class UsersService {
  private readonly _useCases: UsersComposition['useCases']

  constructor(composition: UsersComposition) {
    this._useCases = composition.useCases
  }

  getMe(userId: string) {
    return this._useCases.getMe.execute(userId)
  }

  updateMe(userId: string, payload: UpdateMyProfileInput) {
    return this._useCases.updateMe.execute(userId, payload)
  }

  getUserByUsername(username: string) {
    return this._useCases.getUserByUsername.execute(username)
  }

  getMyStats(userId: string) {
    return this._useCases.getMyStats.execute(userId)
  }

  getMyActivity(userId: string, page: number, limit: number) {
    return this._useCases.getMyActivity.execute(userId, page, limit)
  }

  getMyRecentActivity(userId: string, limit = 10) {
    return this._useCases.getMyRecentActivity.execute(userId, limit)
  }

  getMyStreak(userId: string, year?: number) {
    return this._useCases.getMyStreak.execute(userId, year)
  }

  getMyPublishedTrackers(userId: string, query: PaginationQuery) {
    return this._useCases.getMyPublishedTrackers.execute(userId, query)
  }

  getMyBadges(userId: string, page: number, limit: number) {
    return this._useCases.getMyBadges.execute(userId, page, limit)
  }

  getPublicProfilePage(
    username: string,
    viewerUserId: string | undefined,
    query: PaginationQuery
  ) {
    return this._useCases.getPublicProfilePage.execute(
      username,
      viewerUserId,
      query
    )
  }
}

export const usersService = new UsersService(
  createUsersComposition()
)