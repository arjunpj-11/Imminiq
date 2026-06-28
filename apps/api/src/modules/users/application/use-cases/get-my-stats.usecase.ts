import type { UsersProfileDataServiceContract } from '../services/users-profile-data.service'

export class GetMyStatsUseCase {
  constructor(
    private readonly _usersProfileDataService: UsersProfileDataServiceContract,
  ) {}

  async execute(userId: string) {
    return this._usersProfileDataService.getStats(userId)
  }
}
