import type { UsersRepository } from '../../domain/repositories/users.repository.interface'
import type { ActivityRecord } from '../../domain/types/users.types'
import { mapActivity } from '../utils/users-view-mappers'

export class GetMyRecentActivityUseCase {
  constructor(
    private readonly usersRepository: UsersRepository
  ) {}

  async execute(userId: string, limit = 10) {
    const items = await this.usersRepository.findRecentActivity(userId, limit)

    return {
      items: (items as ActivityRecord[]).map(mapActivity),
    }
  }
}
