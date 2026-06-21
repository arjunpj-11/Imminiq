import type { UserActivityEntity } from '../entities/user-activity.entity'
import type { UserIdInput } from '../value-objects/user-id.vo'

export type UserActivityListResult = {
  items: UserActivityEntity[]
  total: number
}

export type FindUserActivityFeedInput = {
  userId: UserIdInput
  page?: number
  limit?: number
}

export type FindRecentUserActivityInput = {
  userId: UserIdInput
  limit?: number
}

export interface UserActivityRepositoryContract {
  findActivityFeed(
    input: FindUserActivityFeedInput
  ): Promise<UserActivityListResult>

  findRecentActivity(
    input: FindRecentUserActivityInput
  ): Promise<UserActivityEntity[]>
}