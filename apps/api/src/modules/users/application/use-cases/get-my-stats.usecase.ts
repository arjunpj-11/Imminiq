import type { UsersProfileDataServiceContract } from '../services/users-profile-data.service'

export class GetMyStatsUseCase {
  constructor(
    private readonly usersProfileDataService: UsersProfileDataServiceContract,
  ) {}

  async execute(userId: string) {
    return this.usersProfileDataService.getStats(userId)
  }
}
