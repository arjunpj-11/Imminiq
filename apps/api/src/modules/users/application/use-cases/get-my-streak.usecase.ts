import type { UsersProfileDataServiceContract } from '../services/users-profile-data.service'

export class GetMyStreakUseCase {
  constructor(
    private readonly usersProfileDataService: UsersProfileDataServiceContract,
  ) {}

  async execute(userId: string, year?: number) {
    return this.usersProfileDataService.getStreakSummary(userId, year)
  }
}
