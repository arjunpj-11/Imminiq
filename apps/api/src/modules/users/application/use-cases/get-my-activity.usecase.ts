import type { IUserActivityRepository } from '../../domain/repositories/user-activity.repository.interface'
import type { IUsersMapper } from '../mappers/users.mapper'

export class GetMyActivityUseCase {
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