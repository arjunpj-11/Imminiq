import type { IUsersProfileDataReader } from '../services/users-profile-data.service';
import type { StreakSummaryViewDTO } from '../users.dto';

export interface IGetMyStreakUseCase {
  execute(userId: string, year?: number): Promise<StreakSummaryViewDTO>;
}

export class GetMyStreakUseCase implements IGetMyStreakUseCase {
  constructor(private readonly _profileDataReader: IUsersProfileDataReader) {}

  async execute(userId: string, year?: number) {
    return this._profileDataReader.getStreakSummary(userId, year);
  }
}
