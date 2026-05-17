import type { UsersRepository } from '../../domain/repositories/users.repository.interface'
import type { ActivityRecord } from '../../domain/types/users.types'
import { mapActivity } from '../utils/users-view-mappers'

export class GetMyActivityUseCase {
  constructor(
    private readonly usersRepository: UsersRepository
  ) {}

  async execute(userId: string, page: number, limit: number) {
    const { items, total } = await this.usersRepository.findActivityFeed(
      userId,
      page,
      limit
    )

    return {
      items: (items as ActivityRecord[]).map(mapActivity),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.max(1, Math.ceil(total / limit)),
      },
    }
  }
}
