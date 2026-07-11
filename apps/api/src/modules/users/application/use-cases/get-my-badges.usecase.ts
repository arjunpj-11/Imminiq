import type { IUserBadgeRepository } from '../../domain/repositories/user-badge.repository.interface'
import type { IUsersMapper } from '../mappers/users.mapper'

export class GetMyBadgesUseCase {
  constructor(
    private readonly _usersRepository: IUserBadgeRepository,
    private readonly _usersMapper: IUsersMapper,
  ) {}

  async execute(userId: string, page: number, limit: number) {
    const { items, total } =
      await this._usersRepository.findEarnedBadgesPaginated({
        userId,
        page,
        limit,
      })

    return {
      items: items.map((item) =>
        this._usersMapper.toEarnedBadgeView(item),
      ),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.max(1, Math.ceil(total / limit)),
      },
    }
  }
}