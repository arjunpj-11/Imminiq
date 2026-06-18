import type { UserActivityEntity } from '../entities/user-activity.entity'
import type { UserIdInput } from '../value-objects/user-id.vo'

export interface UserActivityRepositoryContract {
  findActivityFeed(
    userId: UserIdInput,
    page?: number,
    limit?: number,
  ): Promise<{ items: UserActivityEntity[]; total: number }>
  findRecentActivity(
    userId: UserIdInput,
    limit?: number,
  ): Promise<UserActivityEntity[]>
}
