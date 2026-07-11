import type { UsersProfileDataReaderContract } from '../services/users-profile-data.service'

export class GetMyStatsUseCase {
  constructor(
    private readonly _profileDataReader: UsersProfileDataReaderContract,
  ) {}

  async execute(userId: string) {
    return this._profileDataReader.getStats(userId)
  }
}
