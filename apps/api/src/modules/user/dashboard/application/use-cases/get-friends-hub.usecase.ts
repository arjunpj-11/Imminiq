import type { IDashboardFriendRepository } from '../../domain/repositories/dashboard-friend.repository.interface'
import type { IDashboardFriendItemDTO } from '../dashboard.dto'
import type { IDashboardMapper } from '../dashboard.mapper'

export interface IGetFriendsHubUseCase {
  execute(userId: string, limit?: number): Promise<IDashboardFriendItemDTO[]>
}

export class GetFriendsHubUseCase implements IGetFriendsHubUseCase {
  constructor(
    private readonly _dashboardRepository: IDashboardFriendRepository,
    private readonly _dashboardMapper: IDashboardMapper
  ) {}

  async execute(userId: string, limit?: number): Promise<IDashboardFriendItemDTO[]> {
    const friends = await this._dashboardRepository.getFriendsHub({
      userId,
      limit,
    })

    return friends.map((friend) => this._dashboardMapper.toFriendItem(friend))
  }
}