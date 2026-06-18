import type { DashboardFriendEntity } from '../entities/dashboard-friend.entity'

export interface DashboardFriendRepositoryContract {
  getFriendsHub(
    userId: string,
    limit?: number
  ): Promise<DashboardFriendEntity[]>
}
