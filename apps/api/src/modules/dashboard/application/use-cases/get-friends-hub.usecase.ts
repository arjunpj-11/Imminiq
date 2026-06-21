import type { DashboardFriendRepositoryContract } from '../../domain/repositories/dashboard-friend.repository.interface'
import type { DashboardFriendItem } from '../dtos/dashboard.dto'
import type { DashboardMapperContract } from '../mappers/dashboard.mapper'

export class GetFriendsHubUseCase {
  constructor(
    private readonly dashboardRepository: DashboardFriendRepositoryContract,
    private readonly dashboardMapper: DashboardMapperContract
  ) {}

  async execute(userId: string, limit?: number): Promise<DashboardFriendItem[]> {
    const friends = await this.dashboardRepository.getFriendsHub({
      userId,
      limit,
    })

    return friends.map((friend) => this.dashboardMapper.toFriendItem(friend))
  }
}