import type { IUserActivityRepository } from '../../domain/repositories/user-activity.repository.interface'
import type { IUsersMapper } from '../users.mapper'

export interface IGetMyRecentActivityUseCase {
  execute(userId: string, limit?: number): Promise<{ items: import("..").IActivityFeedItemViewDTO[]; }>
}

export class GetMyRecentActivityUseCase implements IGetMyRecentActivityUseCase {
  constructor(
    private readonly _usersRepository: IUserActivityRepository,
    private readonly _usersMapper: IUsersMapper,
  ) {}

  async execute(userId: string, limit = 10) {
    const items = await this._usersRepository.findRecentActivity({
      userId,
      limit,
    })

    return {
      items: items.map((item) => this._usersMapper.toActivityView(item)),
    }
  }
}