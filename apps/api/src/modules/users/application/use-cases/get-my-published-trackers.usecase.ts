import type { UserTrackerRepositoryContract } from '../../domain/repositories/user-tracker.repository.interface'
import type { PaginationQuery } from '../dtos/users.dto'
import type { UsersMapperContract } from '../mappers/users.mapper'

export class GetMyPublishedTrackersUseCase {
  constructor(
    private readonly _usersRepository: UserTrackerRepositoryContract,
    private readonly _usersMapper: UsersMapperContract,
  ) {}

  async execute(userId: string, query: PaginationQuery) {
    const { items, total } =
      await this._usersRepository.findPublishedTrackers({
        ownerId: userId,
        query,
        includePrivate: false,
      })

    return {
      items: items.map((item) =>
        this._usersMapper.toPublishedTrackerView(item),
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