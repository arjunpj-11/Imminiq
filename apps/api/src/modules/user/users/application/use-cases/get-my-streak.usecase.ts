import type { IUsersProfileDataReader } from '../services/users-profile-data.service';
import type { IStreakSummaryViewDTO } from '../users.dto';

export interface IGetMyStreakUseCase {
  execute(userId: string, year?: number): Promise<IStreakSummaryViewDTO>;
}

export class GetMyStreakUseCase implements IGetMyStreakUseCase {
  constructor(private readonly _profileDataReader: IUsersProfileDataReader) {}

  async execute(userId: string, year?: number) {
    return this._profileDataReader.getStreakSummary(userId, year);
  }
}
