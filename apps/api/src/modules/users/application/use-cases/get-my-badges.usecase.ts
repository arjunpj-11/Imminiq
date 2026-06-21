import type { UserBadgeRepositoryContract } from '../../domain/repositories/user-badge.repository.interface'
import type { UsersMapperContract } from '../mappers/users.mapper'

export class GetMyBadgesUseCase {
  constructor(
    private readonly usersRepository: UserBadgeRepositoryContract,
    private readonly usersMapper: UsersMapperContract,
  ) {}

  async execute(userId: string, page: number, limit: number) {
    const { items, total } =
      await this.usersRepository.findEarnedBadgesPaginated({
        userId,
        page,
        limit,
      })

    return {
      items: items.map((item) =>
        this.usersMapper.toEarnedBadgeView(item),
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