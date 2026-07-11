import type { IUsersProfileDataReader } from '../services/users-profile-data.service'

export class GetMyStreakUseCase {
  constructor(
    private readonly _profileDataReader: IUsersProfileDataReader,
  ) {}

  async execute(userId: string, year?: number) {
    return this._profileDataReader.getStreakSummary(userId, year)
  }
}
