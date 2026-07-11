import type { UsersProfileDataReaderContract } from '../services/users-profile-data.service'

export class GetMyStreakUseCase {
  constructor(
    private readonly _profileDataReader: UsersProfileDataReaderContract,
  ) {}

  async execute(userId: string, year?: number) {
    return this._profileDataReader.getStreakSummary(userId, year)
  }
}
