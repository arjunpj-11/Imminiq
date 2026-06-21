import type { DashboardFriendEntity } from '../entities/dashboard-friend.entity'

export type GetFriendsHubInput = {
  userId: string
  limit?: number
}

export interface DashboardFriendRepositoryContract {
  getFriendsHub(input: GetFriendsHubInput): Promise<DashboardFriendEntity[]>
}