import type { IUsersProfileDataReader } from '../services/users-profile-data.service'

export interface IGetMyStreakUseCase {
  execute(userId: string, year?: number): Promise<import("..").IStreakSummaryViewDTO>
}

export class GetMyStreakUseCase implements IGetMyStreakUseCase {
  constructor(
    private readonly _profileDataReader: IUsersProfileDataReader,
  ) {}

  async execute(userId: string, year?: number) {
    return this._profileDataReader.getStreakSummary(userId, year)
  }
}
