import type { UserActivityRepositoryContract } from '../../domain/repositories/user-activity.repository.interface'
import type { UsersMapperContract } from '../mappers/users.mapper'

export class GetMyRecentActivityUseCase {
  constructor(
    private readonly usersRepository: UserActivityRepositoryContract,
    private readonly usersMapper: UsersMapperContract,
  ) {}

  async execute(userId: string, limit = 10) {
    const items = await this.usersRepository.findRecentActivity({
      userId,
      limit,
    })

    return {
      items: items.map((item) => this.usersMapper.toActivityView(item)),
    }
  }
}