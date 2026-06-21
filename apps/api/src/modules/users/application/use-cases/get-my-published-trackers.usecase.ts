import type { UserTrackerRepositoryContract } from '../../domain/repositories/user-tracker.repository.interface'
import type { PaginationQuery } from '../dtos/users.dto'
import type { UsersMapperContract } from '../mappers/users.mapper'

export class GetMyPublishedTrackersUseCase {
  constructor(
    private readonly usersRepository: UserTrackerRepositoryContract,
    private readonly usersMapper: UsersMapperContract,
  ) {}

  async execute(userId: string, query: PaginationQuery) {
    const { items, total } =
      await this.usersRepository.findPublishedTrackers({
        ownerId: userId,
        query,
        includePrivate: false,
      })

    return {
      items: items.map((item) =>
        this.usersMapper.toPublishedTrackerView(item),
      ),
      pagination: {
        page: query.page,
        limit: query.limit,
        total,
        totalPages: Math.max(1, Math.ceil(total / query.limit)),
      },
    }
  }
}