import type { UserActivityRepositoryContract } from '../../domain/repositories/user-activity.repository.interface'
import type { UsersMapperContract } from '../mappers/users.mapper'

export class GetMyActivityUseCase {
  constructor(
    private readonly usersRepository: UserActivityRepositoryContract,
    private readonly usersMapper: UsersMapperContract,
  ) {}

  async execute(userId: string, page: number, limit: number) {
    const { items, total } = await this.usersRepository.findActivityFeed({
      userId,
      page,
      limit,
    })

    return {
      items: items.map((item) => this.usersMapper.toActivityView(item)),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.max(1, Math.ceil(total / limit)),
      },
    }
  }
}