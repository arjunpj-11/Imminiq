import type { Types } from 'mongoose'
import type {
  PaginationQuery,
  RelationshipState,
  UpdateMyProfileInput,
} from '../types/users.types'

export interface UsersRepository {
  findUserById(userId: string): Promise<unknown>
  findUserByUsername(username: string): Promise<unknown>
  findProfileByUserId(userId: string | Types.ObjectId): Promise<unknown>

  ensureProfileForUser(
    userId: string | Types.ObjectId,
    fallbackName?: string
  ): Promise<unknown>

  updateProfileByUserId(
    userId: string | Types.ObjectId,
    payload: UpdateMyProfileInput
  ): Promise<unknown>

  findSettingsByUserId(
    userId: string | Types.ObjectId
  ): Promise<unknown>

  findLatestStreakSnapshot(
    userId: string | Types.ObjectId
  ): Promise<unknown>

  findStreakHistoryByYear(
    userId: string | Types.ObjectId,
    year: number
  ): Promise<unknown[]>

  findBadgeShowcase(
    userId: string | Types.ObjectId
  ): Promise<{
    catalog: unknown[]
    earned: unknown[]
  }>

  findEarnedBadgesPaginated(
    userId: string | Types.ObjectId,
    page?: number,
    limit?: number
  ): Promise<{
    items: unknown[]
    total: number
  }>

  findPublishedTrackers(
    ownerId: string | Types.ObjectId,
    query: PaginationQuery,
    includePrivate?: boolean
  ): Promise<{
    items: unknown[]
    total: number
  }>

  findActivityFeed(
    userId: string | Types.ObjectId,
    page?: number,
    limit?: number
  ): Promise<{
    items: unknown[]
    total: number
  }>

  findRecentActivity(
    userId: string | Types.ObjectId,
    limit?: number
  ): Promise<unknown[]>

  getRelationshipState(
    viewerUserId: string | undefined,
    targetUserId: string | Types.ObjectId
  ): Promise<RelationshipState>

  updateUserFullName(
    userId: string,
    fullName: string
  ): Promise<unknown>
}
