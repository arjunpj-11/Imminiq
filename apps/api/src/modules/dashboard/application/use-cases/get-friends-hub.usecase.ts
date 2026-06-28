import type { DashboardFriendRepositoryContract } from '../../domain/repositories/dashboard-friend.repository.interface'
import type { DashboardFriendItem } from '../dtos/dashboard.dto'
import type { DashboardMapperContract } from '../mappers/dashboard.mapper'

export class GetFriendsHubUseCase {
  constructor(
    private readonly _dashboardRepository: DashboardFriendRepositoryContract,
    private readonly _dashboardMapper: DashboardMapperContract
  ) {}

  async execute(userId: string, limit?: number): Promise<DashboardFriendItem[]> {
    const friends = await this._dashboardRepository.getFriendsHub({
      userId,
      limit,
    })

    return friends.map((friend) => this._dashboardMapper.toFriendItem(friend))
  }
}