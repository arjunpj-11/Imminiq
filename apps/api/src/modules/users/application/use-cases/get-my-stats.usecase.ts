import type { IUsersProfileDataReader } from '../services/users-profile-data.service'

export class GetMyStatsUseCase {
  constructor(
    private readonly _profileDataReader: IUsersProfileDataReader,
  ) {}

  async execute(userId: string) {
    return this._profileDataReader.getStats(userId)
  }
}
