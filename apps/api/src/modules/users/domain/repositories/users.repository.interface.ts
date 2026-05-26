import type {
  IdLike,
  PaginationQuery,
  RelationshipState,
  UpdateMyProfileInput,
} from '../types/users.types'

export type UserIdInput = string | IdLike

export interface UsersRepository {
  findUserById(userId: string): Promise<unknown>
  findUserByUsername(username: string): Promise<unknown>
  findProfileByUserId(userId: UserIdInput): Promise<unknown>

  ensureProfileForUser(
    userId: UserIdInput,
    fallbackName?: string
  ): Promise<unknown>

  updateProfileByUserId(
    userId: UserIdInput,
    payload: UpdateMyProfileInput
  ): Promise<unknown>

  findSettingsByUserId(
    userId: UserIdInput
  ): Promise<unknown>

  findLatestStreakSnapshot(
    userId: UserIdInput
  ): Promise<unknown>

  findStreakHistoryByYear(
    userId: UserIdInput,
    year: number
  ): Promise<unknown[]>

  findBadgeShowcase(
    userId: UserIdInput
  ): Promise<{
    catalog: unknown[]
    earned: unknown[]
  }>

  findEarnedBadgesPaginated(
    userId: UserIdInput,
    page?: number,
    limit?: number
  ): Promise<{
    items: unknown[]
    total: number
  }>

  findPublishedTrackers(
    ownerId: UserIdInput,
    query: PaginationQuery,
    includePrivate?: boolean
  ): Promise<{
    items: unknown[]
    total: number
  }>

  findActivityFeed(
    userId: UserIdInput,
    page?: number,
    limit?: number
  ): Promise<{
    items: unknown[]
    total: number
  }>

  findRecentActivity(
    userId: UserIdInput,
    limit?: number
  ): Promise<unknown[]>

  getRelationshipState(
    viewerUserId: string | undefined,
    targetUserId: UserIdInput
  ): Promise<RelationshipState>

  updateUserFullName(
    userId: string,
    fullName: string
  ): Promise<unknown>
}
