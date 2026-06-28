import type { UsersProfileDataServiceContract } from '../services/users-profile-data.service'

export class GetMyStreakUseCase {
  constructor(
    private readonly _usersProfileDataService: UsersProfileDataServiceContract,
  ) {}

  async execute(userId: string, year?: number) {
    return this._usersProfileDataService.getStreakSummary(userId, year)
  }
}
