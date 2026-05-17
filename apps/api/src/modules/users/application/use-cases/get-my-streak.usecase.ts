import type { UsersRepository } from '../../domain/repositories/users.repository.interface'
import { getStreakSummary } from '../helpers/users-profile-data.helper'

export class GetMyStreakUseCase {
  constructor(
    private readonly usersRepository: UsersRepository
  ) {}

  async execute(userId: string, year?: number) {
    return getStreakSummary(this.usersRepository, userId, year)
  }
}
