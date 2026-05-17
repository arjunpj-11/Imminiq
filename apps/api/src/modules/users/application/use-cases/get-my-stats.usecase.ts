import type { UsersRepository } from '../../domain/repositories/users.repository.interface'
import { getStats } from '../helpers/users-profile-data.helper'

export class GetMyStatsUseCase {
  constructor(
    private readonly usersRepository: UsersRepository
  ) {}

  async execute(userId: string) {
    return getStats(this.usersRepository, userId)
  }
}
