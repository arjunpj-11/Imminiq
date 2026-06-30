import type { UserActivityRepositoryContract } from '../../domain/repositories/user-activity.repository.interface'
import type { UsersMapperContract } from '../mappers/users.mapper'

export class GetMyRecentActivityUseCase {
  constructor(
    private readonly _usersRepository: UserActivityRepositoryContract,
    private readonly _usersMapper: UsersMapperContract,
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