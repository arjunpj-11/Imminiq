import type { IUserActivityRepository } from '../../domain/repositories/user-activity.repository.interface'
import type { IUsersMapper } from '../mappers/users.mapper'

export interface IGetMyActivityUseCase {
  execute(userId: string, page: number, limit: number): Promise<{ items: import("..").IActivityFeedItemViewDTO[]; pagination: { page: number; limit: number; total: number; totalPages: number; }; }>
}

export class GetMyActivityUseCase implements IGetMyActivityUseCase {
  constructor(
    private readonly _usersRepository: IUserActivityRepository,
    private readonly _usersMapper: IUsersMapper,
  ) {}

  async execute(userId: string, page: number, limit: number) {
    const { items, total } = await this._usersRepository.findActivityFeed({
      userId,
      page,
      limit,
    })

    return {
      items: items.map((item) => this._usersMapper.toActivityView(item)),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.max(1, Math.ceil(total / limit)),
      },
    }
  }
}