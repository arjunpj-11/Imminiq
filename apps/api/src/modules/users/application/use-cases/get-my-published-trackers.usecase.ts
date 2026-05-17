import type { UsersRepository } from '../../domain/repositories/users.repository.interface'
import type { PaginationQuery } from '../../domain/types/users.types'

export class GetMyPublishedTrackersUseCase {
  constructor(
    private readonly usersRepository: UsersRepository
  ) {}

  async execute(
    userId: string,
    query: PaginationQuery
  ) {
    const { items, total } =
      await this.usersRepository.findPublishedTrackers(userId, query, false)

    return {
      items,
      pagination: {
        page: query.page,
        limit: query.limit,
        total,
        totalPages: Math.max(1, Math.ceil(total / query.limit)),
      },
    }
  }
}
